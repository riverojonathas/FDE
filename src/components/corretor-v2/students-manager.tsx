'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Users, Plus, Edit, Trash2, Search, School, FileCheck, BookOpen } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Tipos para alunos
export interface Student {
  id: string
  name: string
  matricula?: string
  class: string
  email?: string
  notes?: string
  createdAt: string
  correctionCount: number
  averageScore: number
}

// Tipos para turmas
export interface Class {
  id: string
  name: string
  year: string
  students: number
  teacher?: string
  subject?: string
}

// Mock de alunos
export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Ana Silva',
    matricula: '2023001',
    class: '3º Ano A',
    email: 'ana.silva@escola.edu.br',
    notes: 'Aluna com bom desempenho em redação',
    createdAt: '2023-02-15',
    correctionCount: 8,
    averageScore: 8.3
  },
  {
    id: 's2',
    name: 'Carlos Oliveira',
    matricula: '2023002',
    class: '3º Ano A',
    email: 'carlos.oliveira@escola.edu.br',
    createdAt: '2023-02-15',
    correctionCount: 6,
    averageScore: 7.5
  },
  {
    id: 's3',
    name: 'Mariana Santos',
    matricula: '2023010',
    class: '2º Ano B',
    email: 'mariana.santos@escola.edu.br',
    notes: 'Precisa melhorar coesão textual',
    createdAt: '2023-02-20',
    correctionCount: 9,
    averageScore: 6.8
  }
]

// Mock de turmas
export const mockClasses: Class[] = [
  {
    id: 'c1',
    name: '3º Ano A',
    year: '2023',
    students: 32,
    teacher: 'Prof. Roberto Almeida',
    subject: 'Português e Redação'
  },
  {
    id: 'c2',
    name: '2º Ano B',
    year: '2023',
    students: 28,
    teacher: 'Profa. Carla Mendes',
    subject: 'Literatura'
  },
  {
    id: 'c3',
    name: '1º Ano C',
    year: '2023',
    students: 30,
    teacher: 'Prof. Marcos Paulo',
    subject: 'Língua Portuguesa'
  }
]

export function StudentsManager() {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [classes, setClasses] = useState<Class[]>(mockClasses)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  
  // Estado para novo aluno
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id' | 'createdAt' | 'correctionCount' | 'averageScore'>>({
    name: '',
    matricula: '',
    class: '',
    email: '',
    notes: ''
  })
  
  // Estado para nova turma
  const [newClass, setNewClass] = useState<Omit<Class, 'id' | 'students'>>({
    name: '',
    year: new Date().getFullYear().toString(),
    teacher: '',
    subject: ''
  })
  
  // Filtra alunos baseado na busca
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Filtra turmas baseado na busca
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Manipula adição de novo aluno
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.class) {
      toast.error("Nome e turma são campos obrigatórios")
      return
    }
    
    const student: Student = {
      ...newStudent,
      id: `s${students.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
      correctionCount: 0,
      averageScore: 0
    }
    
    setStudents([...students, student])
    setNewStudent({
      name: '',
      matricula: '',
      class: '',
      email: '',
      notes: ''
    })
    setIsAddingStudent(false)
    toast.success("Aluno adicionado com sucesso!")
  }
  
  // Manipula adição de nova turma
  const handleAddClass = () => {
    if (!newClass.name || !newClass.year) {
      toast.error("Nome e ano são campos obrigatórios")
      return
    }
    
    const classItem: Class = {
      ...newClass,
      id: `c${classes.length + 1}`,
      students: 0
    }
    
    setClasses([...classes, classItem])
    setNewClass({
      name: '',
      year: new Date().getFullYear().toString(),
      teacher: '',
      subject: ''
    })
    setIsAddingClass(false)
    toast.success("Turma adicionada com sucesso!")
  }
  
  // Manipula edição de aluno
  const handleStartEditStudent = (student: Student) => {
    setEditingStudentId(student.id)
    setNewStudent({
      name: student.name,
      matricula: student.matricula || '',
      class: student.class,
      email: student.email || '',
      notes: student.notes || ''
    })
    setIsAddingStudent(true)
  }
  
  // Manipula edição de turma
  const handleStartEditClass = (classItem: Class) => {
    setEditingClassId(classItem.id)
    setNewClass({
      name: classItem.name,
      year: classItem.year,
      teacher: classItem.teacher || '',
      subject: classItem.subject || ''
    })
    setIsAddingClass(true)
  }
  
  // Salva edição de aluno
  const handleSaveEditStudent = () => {
    if (!editingStudentId) return
    
    setStudents(students.map(s => 
      s.id === editingStudentId 
        ? { 
            ...s, 
            ...newStudent,
            // Mantém os dados que não são editáveis no formulário
            correctionCount: s.correctionCount,
            averageScore: s.averageScore
          } 
        : s
    ))
    
    setNewStudent({
      name: '',
      matricula: '',
      class: '',
      email: '',
      notes: ''
    })
    setIsAddingStudent(false)
    setEditingStudentId(null)
    toast.success("Aluno atualizado com sucesso!")
  }
  
  // Salva edição de turma
  const handleSaveEditClass = () => {
    if (!editingClassId) return
    
    setClasses(classes.map(c => 
      c.id === editingClassId 
        ? { ...c, ...newClass, students: c.students } 
        : c
    ))
    
    setNewClass({
      name: '',
      year: new Date().getFullYear().toString(),
      teacher: '',
      subject: ''
    })
    setIsAddingClass(false)
    setEditingClassId(null)
    toast.success("Turma atualizada com sucesso!")
  }
  
  // Remove aluno
  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id))
    toast.success("Aluno removido com sucesso!")
  }
  
  // Remove turma
  const handleRemoveClass = (id: string) => {
    // Verifica se existem alunos nesta turma
    const className = classes.find(c => c.id === id)?.name
    const hasStudents = students.some(s => s.class === className)
    
    if (hasStudents) {
      toast.error(`Não é possível remover a turma "${className}" pois existem alunos associados a ela.`)
      return
    }
    
    setClasses(classes.filter(c => c.id !== id))
    toast.success("Turma removida com sucesso!")
  }
  
  // Cancela edição/adição
  const handleCancelStudent = () => {
    setNewStudent({
      name: '',
      matricula: '',
      class: '',
      email: '',
      notes: ''
    })
    setIsAddingStudent(false)
    setEditingStudentId(null)
  }
  
  // Cancela edição/adição
  const handleCancelClass = () => {
    setNewClass({
      name: '',
      year: new Date().getFullYear().toString(),
      teacher: '',
      subject: ''
    })
    setIsAddingClass(false)
    setEditingClassId(null)
  }
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Alunos</h2>
          <p className="text-muted-foreground">Gerencie alunos e turmas para correção</p>
        </div>
      </div>
      
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, turma, matrícula..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="students">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">
            <User className="h-4 w-4 mr-2" />
            Alunos
          </TabsTrigger>
          <TabsTrigger value="classes">
            <Users className="h-4 w-4 mr-2" />
            Turmas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="space-y-4 mt-4">
          {/* Botão para adicionar aluno */}
          <div className="flex justify-end">
            <Button onClick={() => setIsAddingStudent(true)} disabled={isAddingStudent}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluno
            </Button>
          </div>
          
          {/* Formulário de adição/edição de aluno */}
          {isAddingStudent && (
            <Card>
              <CardHeader>
                <CardTitle>{editingStudentId ? 'Editar Aluno' : 'Novo Aluno'}</CardTitle>
                <CardDescription>
                  {editingStudentId 
                    ? 'Altere os dados do aluno' 
                    : 'Preencha os dados para cadastrar um novo aluno'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo*</Label>
                    <Input
                      id="name"
                      placeholder="Nome do aluno"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula/ID</Label>
                    <Input
                      id="matricula"
                      placeholder="Identificação do aluno"
                      value={newStudent.matricula}
                      onChange={(e) => setNewStudent({...newStudent, matricula: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Turma*</Label>
                    <Select 
                      value={newStudent.class} 
                      onValueChange={(value) => setNewStudent({...newStudent, class: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="E-mail do aluno"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre o aluno..."
                    value={newStudent.notes}
                    onChange={(e) => setNewStudent({...newStudent, notes: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancelStudent}>
                  Cancelar
                </Button>
                <Button onClick={editingStudentId ? handleSaveEditStudent : handleAddStudent}>
                  {editingStudentId ? 'Salvar Alterações' : 'Adicionar Aluno'}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Lista de alunos */}
          <Card>
            <CardHeader>
              <CardTitle>Alunos Cadastrados</CardTitle>
              <CardDescription>
                {filteredStudents.length} alunos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <Card key={student.id} className="hover:bg-accent transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{student.name}</CardTitle>
                                <div className="flex items-center gap-3 mt-1">
                                  {student.matricula && (
                                    <Badge variant="outline" className="text-xs font-normal">
                                      {student.matricula}
                                    </Badge>
                                  )}
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <School className="h-3 w-3" />
                                    {student.class}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleStartEditStudent(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveStudent(student.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          {student.email && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {student.email}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                            <div className="flex items-center gap-1 text-sm">
                              <FileCheck className="h-4 w-4 text-muted-foreground" />
                              <span>{student.correctionCount} correções</span>
                            </div>
                            
                            {student.correctionCount > 0 && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Média: </span>
                                <Badge 
                                  variant={
                                    student.averageScore >= 7 ? "success" : 
                                    student.averageScore >= 5 ? "warning" : 
                                    "destructive"
                                  }
                                >
                                  {student.averageScore.toFixed(1)}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          {student.notes && (
                            <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                              {student.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <User className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Nenhum aluno encontrado</h3>
                      <p className="text-sm text-muted-foreground max-w-md mt-1">
                        {searchTerm 
                          ? `Não encontramos alunos correspondentes à busca "${searchTerm}".` 
                          : "Não há alunos cadastrados. Adicione um novo aluno para começar."}
                      </p>
                      {searchTerm && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setSearchTerm('')}
                        >
                          Limpar busca
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classes" className="space-y-4 mt-4">
          {/* Botão para adicionar turma */}
          <div className="flex justify-end">
            <Button onClick={() => setIsAddingClass(true)} disabled={isAddingClass}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </div>
          
          {/* Formulário de adição/edição de turma */}
          {isAddingClass && (
            <Card>
              <CardHeader>
                <CardTitle>{editingClassId ? 'Editar Turma' : 'Nova Turma'}</CardTitle>
                <CardDescription>
                  {editingClassId 
                    ? 'Altere os dados da turma' 
                    : 'Preencha os dados para cadastrar uma nova turma'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Nome da Turma*</Label>
                    <Input
                      id="className"
                      placeholder="Ex: 3º Ano A"
                      value={newClass.name}
                      onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano*</Label>
                    <Input
                      id="year"
                      placeholder="Ano letivo"
                      value={newClass.year}
                      onChange={(e) => setNewClass({...newClass, year: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher">Professor Responsável</Label>
                    <Input
                      id="teacher"
                      placeholder="Nome do professor"
                      value={newClass.teacher}
                      onChange={(e) => setNewClass({...newClass, teacher: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Disciplina Principal</Label>
                    <Input
                      id="subject"
                      placeholder="Disciplina"
                      value={newClass.subject}
                      onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancelClass}>
                  Cancelar
                </Button>
                <Button onClick={editingClassId ? handleSaveEditClass : handleAddClass}>
                  {editingClassId ? 'Salvar Alterações' : 'Adicionar Turma'}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Lista de turmas */}
          <Card>
            <CardHeader>
              <CardTitle>Turmas Cadastradas</CardTitle>
              <CardDescription>
                {filteredClasses.length} turmas encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((classItem) => (
                      <Card key={classItem.id} className="hover:bg-accent transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle className="text-base">{classItem.name}</CardTitle>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-xs font-normal">
                                  {classItem.year}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {classItem.students} alunos
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleStartEditClass(classItem)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveClass(classItem.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          {(classItem.teacher || classItem.subject) && (
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              {classItem.teacher && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5" />
                                  {classItem.teacher}
                                </div>
                              )}
                              {classItem.subject && (
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3.5 w-3.5" />
                                  {classItem.subject}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Users className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Nenhuma turma encontrada</h3>
                      <p className="text-sm text-muted-foreground max-w-md mt-1">
                        {searchTerm 
                          ? `Não encontramos turmas correspondentes à busca "${searchTerm}".` 
                          : "Não há turmas cadastradas. Adicione uma nova turma para começar."}
                      </p>
                      {searchTerm && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setSearchTerm('')}
                        >
                          Limpar busca
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 