import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getSession } from '@/lib/neo4j'

export async function POST(request: NextRequest) {
  const session = getSession()
  try {
    // ── Query expiring drivers ────────────────────────────────────────────────
    const today = new Date()
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() + 30)
    const todayStr = today.toISOString().split('T')[0]
    const cutoffStr = cutoff.toISOString().split('T')[0]

    const result = await session.run(
      `
      MATCH (d:Driver)
      WHERE d.licenseExpiryDate <= $cutoff
      RETURN d { .* } AS driver,
             CASE 
               WHEN d.licenseExpiryDate < $today THEN 'EXPIRED'
               ELSE 'EXPIRING SOON'
             END AS alertType
      ORDER BY d.licenseExpiryDate ASC
      `,
      { today: todayStr, cutoff: cutoffStr }
    )

    if (result.records.length === 0) {
      return NextResponse.json({
        sent: false,
        message: 'No drivers with expiring or expired licenses found.',
        count: 0,
      })
    }

    const drivers = result.records.map((record) => ({
      ...record.get('driver'),
      alertType: record.get('alertType'),
      daysUntilExpiry: Math.ceil(
        (new Date(record.get('driver').licenseExpiryDate).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    }))

    // ── Build Email HTML ──────────────────────────────────────────────────────
    const tableRows = drivers
      .map(
        (d) => `
        <tr style="background:${d.alertType === 'EXPIRED' ? '#fef2f2' : '#fffbeb'}">
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${d.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${d.licenseNumber}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${d.licenseExpiryDate}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:${
            d.alertType === 'EXPIRED' ? '#dc2626' : '#d97706'
          };">
            ${d.alertType} (${d.daysUntilExpiry < 0 ? `${Math.abs(d.daysUntilExpiry)} days ago` : `${d.daysUntilExpiry} days left`})
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${d.contactNumber}</td>
        </tr>`
      )
      .join('')

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Inter,system-ui,sans-serif;background:#f8fafc;padding:0;margin:0;">
      <div style="max-width:700px;margin:32px auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:#1e40af;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">🚛 TransitOps — License Expiry Alert</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Generated ${today.toLocaleDateString('en-IN')} at ${today.toLocaleTimeString('en-IN')}</p>
        </div>
        <div style="padding:24px 32px;">
          <p style="color:#374151;font-size:14px;">
            The following <strong>${drivers.length} driver(s)</strong> have licenses that are 
            <span style="color:#dc2626;font-weight:bold;">expired</span> or 
            <span style="color:#d97706;font-weight:bold;">expiring within 30 days</span> 
            and require immediate attention.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px;">
            <thead>
              <tr style="background:#1e40af;color:#fff;">
                <th style="padding:10px 12px;text-align:left;">Driver Name</th>
                <th style="padding:10px 12px;text-align:left;">License No.</th>
                <th style="padding:10px 12px;text-align:left;">Expiry Date</th>
                <th style="padding:10px 12px;text-align:left;">Status</th>
                <th style="padding:10px 12px;text-align:left;">Contact</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div style="margin-top:24px;padding:16px;background:#f0f9ff;border-radius:6px;border:1px solid #bae6fd;">
            <p style="margin:0;font-size:13px;color:#0369a1;">
              ⚠️ Drivers with expired or suspended licenses are automatically excluded from the 
              dispatch pool. Please renew their licenses to restore dispatch eligibility.
            </p>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;background:#f9fafb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            This is an automated alert from TransitOps Fleet Management. Do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>`

    // ── Send via Nodemailer ───────────────────────────────────────────────────
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const notifyEmail = process.env.NOTIFY_EMAIL || 'manager@transitops.com'

    if (!smtpHost || !smtpUser || !smtpPass) {
      // Graceful fallback: log to console and return drivers without sending
      console.log('━━━ EMAIL PREVIEW (SMTP not configured) ━━━')
      console.log(`To: ${notifyEmail}`)
      console.log(`Subject: [TransitOps] License Expiry Alert — ${drivers.length} Driver(s) Require Attention`)
      console.log(`Drivers: ${drivers.map((d) => `${d.name} (${d.licenseExpiryDate} — ${d.alertType})`).join(', ')}`)
      console.log('━━━ Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local to send real emails ━━━')

      return NextResponse.json({
        sent: false,
        message: 'SMTP not configured — email preview logged to server console. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env.local to enable real email sending.',
        count: drivers.length,
        drivers: drivers.map((d) => ({ name: d.name, licenseExpiryDate: d.licenseExpiryDate, alertType: d.alertType })),
      })
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: `"TransitOps Alerts" <${smtpUser}>`,
      to: notifyEmail,
      subject: `[TransitOps] License Expiry Alert — ${drivers.length} Driver(s) Require Attention`,
      html: emailHtml,
    })

    return NextResponse.json({
      sent: true,
      message: `Expiry reminder sent to ${notifyEmail}`,
      count: drivers.length,
      drivers: drivers.map((d) => ({ name: d.name, licenseExpiryDate: d.licenseExpiryDate, alertType: d.alertType })),
    })
  } catch (error) {
    console.error('Error sending expiry reminders:', error)
    return NextResponse.json({ error: 'Failed to send expiry reminders' }, { status: 500 })
  } finally {
    await session.close()
  }
}
