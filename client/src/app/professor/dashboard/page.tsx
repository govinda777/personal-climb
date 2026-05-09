import { Button } from "@/components/ui/Button";
import { Users, AlertTriangle, CheckCircle2, TrendingUp, Clock } from "lucide-react";

export default function ProfessorDashboard() {
  const students = [
    { id: 1, name: "Ana Silva", status: "pending", lastTrain: "1 dia atrás", grade: "V6" },
    { id: 2, name: "Lucas Melo", status: "active", lastTrain: "4 dias atrás", grade: "V8", alert: true },
    { id: 3, name: "Bia Costa", status: "pending", lastTrain: "Hoje", grade: "V4" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
      <nav className="p-6 bg-white border-b border-zinc-200 flex justify-between items-center">
        <h1 className="font-bold text-xl tracking-tighter uppercase">Painel do Treinador</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-500">Treinador: Academia Boulder</span>
          <div className="w-10 h-10 bg-zinc-200 rounded-full" />
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Alunos", value: "42", icon: Users },
            { label: "Aguardando Aprovação", value: "5", icon: Clock, color: "text-amber-500" },
            { label: "Inativos (>3 dias)", value: "12", icon: AlertTriangle, color: "text-red-500" },
            { label: "Taxa de Evolução", value: "+12%", icon: TrendingUp, color: "text-emerald-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color || "text-zinc-400"}`} />
              </div>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Table */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="font-bold">Ações Prioritárias</h2>
            <Button variant="outline" size="sm">Ver todos os alunos</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4">Último Treino</th>
                  <th className="px-6 py-4">Grau</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-xs">
                          {student.name[0]}
                        </div>
                        <span className="font-medium">
                          {student.name}
                          {student.alert && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">INATIVO</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{student.lastTrain}</td>
                    <td className="px-6 py-4"><span className="font-mono bg-zinc-100 px-2 py-1 rounded">{student.grade}</span></td>
                    <td className="px-6 py-4 text-right">
                      {student.status === "pending" ? (
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600">Aprovar Treino IA</Button>
                      ) : (
                        <Button variant="outline" size="sm">Ver Perfil</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
