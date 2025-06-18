import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus } from "lucide-react"

interface ComparisonCardProps {
  title: string
  originalData?: any
  proposedData: any
  action: "create" | "update" | "delete"
}

export function ComparisonCard({ title, originalData, proposedData, action }: ComparisonCardProps) {
  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes("price") || key.toLowerCase().includes("cost")) {
      return `Rs ${Number(value).toLocaleString()}`
    }
    if (key.toLowerCase().includes("date")) {
      return new Date(value).toLocaleDateString("en-IN")
    }
    return String(value)
  }

  const formatKey = (key: string) => {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  if (action === "create") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            New {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(proposedData).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                <span className="font-medium text-green-700">{formatKey(key)}:</span>
                <span className="text-green-900 font-semibold">{formatValue(key, value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (action === "delete") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <Minus className="h-5 w-5 mr-2" />
            Delete {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {originalData &&
              Object.entries(originalData).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-white rounded border border-red-200">
                  <span className="font-medium text-red-700">{formatKey(key)}:</span>
                  <span className="text-red-900 line-through">{formatValue(key, value)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Update action
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Update {title}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Data */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center text-lg">
              <Minus className="h-4 w-4 mr-2" />
              Current
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {originalData &&
                Object.entries(originalData).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-2 bg-white rounded border border-red-200"
                  >
                    <span className="font-medium text-red-700 text-sm">{formatKey(key)}:</span>
                    <span className="text-red-900 text-sm">{formatValue(key, value)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Proposed Data */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center text-lg">
              <Plus className="h-4 w-4 mr-2" />
              Proposed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(proposedData).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-center p-2 bg-white rounded border border-green-200"
                >
                  <span className="font-medium text-green-700 text-sm">{formatKey(key)}:</span>
                  <span className="text-green-900 text-sm font-semibold">{formatValue(key, value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
