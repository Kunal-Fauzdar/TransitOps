import { NextRequest, NextResponse } from 'next/server'
import { getFuelEfficiencyData } from '../fuel-efficiency/route'
import { getUtilizationData } from '../utilization/route'
import { getOperationalCostData } from '../operational-cost/route'
import { getRoiData } from '../roi/route'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  try {
    let data: any[] = []
    let headers: string[] = []
    let fileName = 'report.csv'

    switch (type) {
      case 'fuel-efficiency':
        data = await getFuelEfficiencyData()
        headers = ['Registration Number', 'Vehicle Model', 'Total Distance (km)', 'Total Fuel (liters)', 'Efficiency (km/L)']
        fileName = 'fuel_efficiency_report.csv'
        break

      case 'utilization':
        data = await getUtilizationData()
        headers = ['Vehicle Type', 'Total Fleet Size', 'Active Vehicles On Trip', 'Utilization %']
        fileName = 'fleet_utilization_report.csv'
        break

      case 'operational-cost':
        data = await getOperationalCostData()
        headers = ['Registration Number', 'Vehicle Model', 'Fuel Cost', 'Maintenance Cost', 'Other Expenses', 'Total Operating Cost']
        fileName = 'operational_cost_report.csv'
        break

      case 'roi':
        data = await getRoiData()
        headers = ['Registration Number', 'Vehicle Model', 'Acquisition Cost', 'Estimated Revenue', 'Operating Costs', 'ROI %']
        fileName = 'roi_report.csv'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid report type. Supported values are: fuel-efficiency, utilization, operational-cost, roi' },
          { status: 400 }
        )
    }

    // Convert data to CSV string
    const csvRows = [headers.join(',')]

    for (const item of data) {
      const values = Object.values(item).map(val => {
        const strVal = String(val === null || val === undefined ? '' : val)
        // Escape quotes and wrap in quotes if value contains commas
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`
        }
        return strVal
      })
      csvRows.push(values.join(','))
    }

    const csvContent = csvRows.join('\n')

    // Return the response as a downloadable attachment
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error generating CSV report:', error)
    return NextResponse.json({ error: 'Failed to generate CSV export' }, { status: 500 })
  }
}
