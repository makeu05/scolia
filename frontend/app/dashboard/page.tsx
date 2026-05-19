'use client';
import { Users, TrendingUp, DollarSign, Mail, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { GradesChart } from "@/components/dashboard/grades-chart"
import { PaymentsChart } from "@/components/dashboard/payments-chart"
import { RecentActivities } from "@/components/dashboard/recent-activities"

export default function DashboardPage() {
  const router = useRouter();

  function handleLogout() {
    // 🔥 supprimer le token cookie
    document.cookie = "token=; path=/; max-age=0";

    // optionnel : nettoyer localStorage si tu l’utilises encore
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // redirection login
    router.push("/login");
  }

  return (
    <DashboardLayout>
      {/* Header avec logout */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, Marie. Voici un aperçu de votre établissement.
          </p>
        </div>

        {/* 🔴 Bouton logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total élèves"
          value="1,284"
          icon={Users}
          badge="actifs"
          badgeVariant="secondary"
          trend={{ value: "12% vs mois dernier", positive: true }}
        />
        <StatCard
          title="Taux de réussite"
          value="87.5%"
          icon={TrendingUp}
          iconBgClassName="bg-accent/10"
          iconClassName="text-accent"
          trend={{ value: "3.2% vs trimestre dernier", positive: true }}
        />
        <StatCard
          title="Revenus ce mois"
          value="48,250 €"
          icon={DollarSign}
          iconBgClassName="bg-chart-3/10"
          iconClassName="text-chart-3"
          trend={{ value: "8% vs mois dernier", positive: true }}
        />
        <StatCard
          title="Messages non lus"
          value="23"
          icon={Mail}
          badge="urgent: 5"
          badgeVariant="default"
          iconBgClassName="bg-destructive/10"
          iconClassName="text-destructive"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <GradesChart />
        <PaymentsChart />
      </div>

      {/* Recent Activities */}
      <RecentActivities />
    </DashboardLayout>
  )
}