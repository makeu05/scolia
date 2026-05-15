import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  badge?: string
  badgeVariant?: "default" | "secondary" | "outline"
  trend?: {
    value: string
    positive: boolean
  }
  iconBgClassName?: string
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  badge,
  badgeVariant = "secondary",
  trend,
  iconBgClassName,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {badge && (
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-accent" : "text-destructive"
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl",
              iconBgClassName || "bg-primary/10"
            )}
          >
            <Icon className={cn("size-6", iconClassName || "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
