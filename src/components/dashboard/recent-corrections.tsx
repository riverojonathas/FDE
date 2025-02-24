import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentCorrections = [
  {
    id: "1",
    student: {
      name: "João Silva",
      email: "joao@example.com",
    },
    subject: "Matemática",
    grade: 8.5,
    date: "2024-02-20",
  },
  {
    id: "2",
    student: {
      name: "Maria Santos",
      email: "maria@example.com",
    },
    subject: "Português",
    grade: 9.0,
    date: "2024-02-19",
  },
  {
    id: "3",
    student: {
      name: "Pedro Oliveira",
      email: "pedro@example.com",
    },
    subject: "História",
    grade: 7.5,
    date: "2024-02-18",
  },
]

export function RecentCorrections() {
  return (
    <div className="space-y-8">
      {recentCorrections.map((correction) => (
        <div key={correction.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${correction.student.email}`} alt={correction.student.name} />
            <AvatarFallback>
              {correction.student.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{correction.student.name}</p>
            <p className="text-sm text-muted-foreground">
              {correction.subject}
            </p>
          </div>
          <div className="ml-auto font-medium">
            Nota: {correction.grade}
          </div>
        </div>
      ))}
    </div>
  )
} 