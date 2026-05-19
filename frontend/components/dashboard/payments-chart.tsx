"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { month: "Oct", montant: 45000 },
  { month: "Nov", montant: 52000 },
  { month: "Déc", montant: 38000 },
  { month: "Jan", montant: 61000 },
  { month: "Fév", montant: 55000 },
  { month: "Mar", montant: 48000 },
]

export function PaymentsChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Paiements par mois
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) =>
                  `${(value / 1000).toFixed(0)}k€`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number) => [
                  `${value.toLocaleString("fr-FR")} €`,
                  "Montant",
                ]}
              />
              <Bar
                dataKey="montant"
                fill="hsl(var(--accent))"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
