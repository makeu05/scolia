import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "complété" | "en cours" | "en attente"

interface Activity {
  id: string
  eleve: string
  action: string
  date: string
  statut: Status
}

const activities: Activity[] = [
  {
    id: "1",
    eleve: "Lucas Martin",
    action: "Inscription validée",
    date: "15 Mar 2026",
    statut: "complété",
  },
  {
    id: "2",
    eleve: "Emma Bernard",
    action: "Paiement reçu",
    date: "15 Mar 2026",
    statut: "complété",
  },
  {
    id: "3",
    eleve: "Hugo Petit",
    action: "Note ajoutée",
    date: "14 Mar 2026",
    statut: "en cours",
  },
  {
    id: "4",
    eleve: "Léa Dubois",
    action: "Absence signalée",
    date: "14 Mar 2026",
    statut: "en attente",
  },
  {
    id: "5",
    eleve: "Nathan Moreau",
    action: "Certificat demandé",
    date: "13 Mar 2026",
    statut: "en cours",
  },
]

const statusStyles: Record<Status, string> = {
  complété: "bg-accent/10 text-accent border-accent/20",
  "en cours": "bg-primary/10 text-primary border-primary/20",
  "en attente": "bg-warning/10 text-warning-foreground border-warning/20",
}

export function RecentActivities() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Activités récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Élève</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="pr-6 text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="pl-6 font-medium">
                  {activity.eleve}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.action}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.date}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge
                    variant="outline"
                    className={cn("capitalize", statusStyles[activity.statut])}
                  >
                    {activity.statut}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
