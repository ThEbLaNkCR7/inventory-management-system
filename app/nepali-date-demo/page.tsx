import { NepaliDateConverter } from '../../components/ui/nepali-date-converter'

export default function NepaliDateDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nepali Date Conversion Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates the comprehensive Nepali date conversion system for the inventory management application.
          </p>
        </div>
        
        <NepaliDateConverter />
        
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Integration Examples</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">In Tables:</h3>
              <code className="bg-background p-2 rounded block">
                {`import { formatNepaliDateForTable } from '@/lib/nepaliDateUtils'
<td>{formatNepaliDateForTable(product.createdAt)}</td>`}
              </code>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">In Reports:</h3>
              <code className="bg-background p-2 rounded block">
                {`import { formatDateForReports, getCurrentNepaliYear } from '@/lib/nepaliDateUtils'
<h2>Sales Report - {getCurrentNepaliYear()}</h2>
<span>{formatDateForReports(sale.date)}</span>`}
              </code>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">In Forms:</h3>
              <code className="bg-background p-2 rounded block">
                {`import { englishToNepali, formatDateForInput } from '@/lib/nepaliDateUtils'
const nepaliDate = englishToNepali(new Date(value))
const formatted = formatDateForInput(nepaliDate)`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 