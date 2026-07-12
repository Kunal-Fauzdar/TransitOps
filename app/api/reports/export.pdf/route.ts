import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'
import { getFuelEfficiencyData } from '../fuel-efficiency/route'
import { getUtilizationData } from '../utilization/route'
import { getOperationalCostData } from '../operational-cost/route'
import { getRoiData } from '../roi/route'

type ReportConfig = {
  title: string
  subtitle: string
  headers: string[]
  rowMapper: (item: any) => string[]
}

const REPORT_CONFIGS: Record<string, ReportConfig> = {
  'fuel-efficiency': {
    title: 'Fuel Efficiency Report',
    subtitle: 'Distance / Fuel ratio per vehicle for Completed trips',
    headers: ['Reg. Number', 'Vehicle Model', 'Distance (km)', 'Fuel (L)', 'Efficiency (km/L)'],
    rowMapper: (d) => [d.regNumber, d.name, String(d.totalDistance), String(d.totalFuel), String(d.efficiency)],
  },
  utilization: {
    title: 'Fleet Utilization Report',
    subtitle: 'Active vs total vehicles per type (non-Retired fleet)',
    headers: ['Vehicle Type', 'Total Size', 'Active On Trip', 'Utilization %'],
    rowMapper: (d) => [d.type, String(d.totalType), String(d.activeType), `${d.utilizationPct}%`],
  },
  'operational-cost': {
    title: 'Operational Cost Report',
    subtitle: 'Fuel, Maintenance, and Expenses per vehicle',
    headers: ['Reg. Number', 'Vehicle Model', 'Fuel (Rs)', 'Maint. (Rs)', 'Other (Rs)', 'Total (Rs)'],
    rowMapper: (d) => [d.regNumber, d.name, String(d.fuelCost), String(d.maintenanceCost), String(d.otherExpenses), String(d.totalCost)],
  },
  roi: {
    title: 'Vehicle ROI Report',
    subtitle: '(Revenue - Operating Costs) / Acquisition Cost',
    headers: ['Reg. Number', 'Vehicle Model', 'Acquisition (Rs)', 'Revenue (Rs)', 'OpEx (Rs)', 'ROI %'],
    rowMapper: (d) => [d.regNumber, d.name, String(d.acquisitionCost), String(d.revenue), String(d.totalCost), `${d.roi}%`],
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (!type || !REPORT_CONFIGS[type]) {
    return NextResponse.json(
      { error: 'Invalid report type. Supported values: fuel-efficiency, utilization, operational-cost, roi' },
      { status: 400 }
    )
  }

  try {
    let data: any[] = []
    switch (type) {
      case 'fuel-efficiency': data = await getFuelEfficiencyData(); break
      case 'utilization': data = await getUtilizationData(); break
      case 'operational-cost': data = await getOperationalCostData(); break
      case 'roi': data = await getRoiData(); break
    }

    const config = REPORT_CONFIGS[type]
    const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    // ── Create PDF ────────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create()
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const [pageWidth, pageHeight] = PageSizes.A4
    let page = pdfDoc.addPage([pageWidth, pageHeight])

    // Colors
    const navy = rgb(0.118, 0.251, 0.686)   // #1e40af
    const darkGray = rgb(0.067, 0.094, 0.153) // #111827
    const midGray = rgb(0.42, 0.447, 0.502)  // #6b7280
    const white = rgb(1, 1, 1)
    const lightRow = rgb(0.976, 0.980, 0.984) // #f9fafb

    let y = pageHeight - 40

    // ── Header Bar ───────────────────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: pageHeight - 80, width: pageWidth, height: 80, color: navy })
    page.drawText('TransitOps', { x: 40, y: pageHeight - 30, size: 10, font: fontNormal, color: rgb(0.749, 0.855, 0.996) })
    page.drawText(config.title, { x: 40, y: pageHeight - 55, size: 18, font: fontBold, color: white })

    y = pageHeight - 110

    // ── Subtitle + Date ───────────────────────────────────────────────────────
    page.drawText(config.subtitle, { x: 40, y, size: 9, font: fontNormal, color: midGray })
    y -= 14
    page.drawText(`Generated: ${generatedAt}`, { x: 40, y, size: 8, font: fontNormal, color: midGray })
    y -= 24

    // ── Table ────────────────────────────────────────────────────────────────
    const tableX = 40
    const tableWidth = pageWidth - 80
    const colCount = config.headers.length
    const colWidth = tableWidth / colCount
    const rowHeight = 22

    // Table header background
    page.drawRectangle({ x: tableX, y: y - rowHeight + 6, width: tableWidth, height: rowHeight, color: navy })

    // Header text
    config.headers.forEach((header, i) => {
      page.drawText(header, {
        x: tableX + i * colWidth + 6,
        y: y - rowHeight + 12,
        size: 8,
        font: fontBold,
        color: white,
        maxWidth: colWidth - 8,
      })
    })
    y -= rowHeight

    // Draw a horizontal line under header
    page.drawLine({ start: { x: tableX, y }, end: { x: tableX + tableWidth, y }, thickness: 0.5, color: navy })

    if (data.length === 0) {
      page.drawText('No data available for this report.', { x: tableX, y: y - 20, size: 10, font: fontNormal, color: midGray })
    }

    // Data rows
    data.forEach((item, rowIndex) => {
      const cells = config.rowMapper(item)

      // Alternating row background
      if (rowIndex % 2 === 1) {
        page.drawRectangle({ x: tableX, y: y - rowHeight + 6, width: tableWidth, height: rowHeight, color: lightRow })
      }

      // Cell text
      cells.forEach((cell, colIndex) => {
        const cellText = String(cell).substring(0, 22) // truncate long values
        page.drawText(cellText, {
          x: tableX + colIndex * colWidth + 6,
          y: y - rowHeight + 10,
          size: 8,
          font: fontNormal,
          color: darkGray,
          maxWidth: colWidth - 8,
        })
      })

      // Bottom border line
      page.drawLine({
        start: { x: tableX, y: y - rowHeight + 6 },
        end: { x: tableX + tableWidth, y: y - rowHeight + 6 },
        thickness: 0.3,
        color: rgb(0.898, 0.914, 0.929),
      })

      y -= rowHeight

      // Add new page if running out of space
      if (y < 80) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        y = pageHeight - 40
      }
    })

    // ── Footer on last page ───────────────────────────────────────────────────
    page.drawLine({ start: { x: 40, y: 50 }, end: { x: pageWidth - 40, y: 50 }, thickness: 0.5, color: rgb(0.898, 0.914, 0.929) })
    page.drawText('TransitOps — Fleet Management Platform', { x: 40, y: 35, size: 7, font: fontNormal, color: midGray })
    page.drawText(`Page 1 of ${pdfDoc.getPageCount()}`, { x: pageWidth - 100, y: 35, size: 7, font: fontNormal, color: midGray })

    const pdfBytes = await pdfDoc.save()
    const fileName = `transitops_${type.replace('-', '_')}_report.pdf`

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfBytes.length),
      },
    })
  } catch (error) {
    console.error('Error generating PDF report:', error)
    return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 })
  }
}
