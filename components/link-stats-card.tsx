import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LinkStatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
}

export function LinkStatsCard({ title, value, description, icon }: LinkStatsCardProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
