[
    {
      "table_name": "answers",
      "colunas": [
        "answer text NOT NULL",
        "created_at timestamp with time zone NOT NULL",
        "id uuid NOT NULL",
        "question_id uuid"
      ],
      "relacoes": [
        "question_id -> questions.id"
      ]
    },
    {
      "table_name": "cities",
      "colunas": [
        "created_at timestamp with time zone",
        "id uuid NOT NULL",
        "name text NOT NULL",
        "state text NOT NULL"
      ],
      "relacoes": null
    },
    {
      "table_name": "classes",
      "colunas": [
        "id uuid NOT NULL",
        "name text NOT NULL"
      ],
      "relacoes": null
    },
    {
      "table_name": "correction_analytics",
      "colunas": [
        "correction_id uuid",
        "cost numeric NOT NULL",
        "created_at timestamp with time zone NOT NULL",
        "execution_batch text",
        "id uuid NOT NULL",
        "manual_execution boolean",
        "processing_time numeric NOT NULL",
        "raw_prompt text",
        "raw_response text",
        "type text NOT NULL"
      ],
      "relacoes": [
        "correction_id -> corrections.id"
      ]
    },
    {
      "table_name": "corrections",
      "colunas": [
        "answer_id uuid",
        "created_at timestamp with time zone NOT NULL",
        "details jsonb NOT NULL",
        "feedback text NOT NULL",
        "id uuid NOT NULL",
        "pipeline_type text",
        "prompt text NOT NULL",
        "score numeric NOT NULL",
        "status_details jsonb",
        "student_id uuid",
        "student_name text"
      ],
      "relacoes": [
        "answer_id -> student_responses.id"
      ]
    },
    {
      "table_name": "curriculums",
      "colunas": [
        "ano text NOT NULL",
        "created_at timestamp with time zone NOT NULL",
        "education_level_id uuid NOT NULL",
        "grade_id uuid NOT NULL",
        "id uuid NOT NULL",
        "subject_id uuid NOT NULL"
      ],
      "relacoes": [
        "education_level_id -> education_levels.id",
        "grade_id -> grades.id",
        "subject_id -> subjects.id"
      ]
    },
    {
      "table_name": "dashboard_metrics",
      "colunas": [
        "average_score numeric NOT NULL",
        "average_time numeric NOT NULL",
        "created_at timestamp with time zone NOT NULL",
        "date date NOT NULL",
        "id uuid NOT NULL",
        "strengths jsonb",
        "total_corrections integer NOT NULL",
        "total_cost numeric NOT NULL",
        "weaknesses jsonb"
      ],
      "relacoes": null
    },
    {
      "table_name": "education_levels",
      "colunas": [
        "id uuid NOT NULL",
        "name text NOT NULL"
      ],
      "relacoes": null
    },
    {
      "table_name": "evaluators",
      "colunas": [
        "active boolean",
        "created_at timestamp with time zone",
        "email text",
        "id uuid NOT NULL",
        "metadata jsonb",
        "name text NOT NULL",
        "role text",
        "updated_at timestamp with time zone"
      ],
      "relacoes": null
    },
    {
      "table_name": "grades",
      "colunas": [
        "education_level_id uuid NOT NULL",
        "id uuid NOT NULL",
        "name text NOT NULL"
      ],
      "relacoes": [
        "education_level_id -> education_levels.id"
      ]
    },
    {
      "table_name": "questions",
      "colunas": [
        "base_text text",
        "code text NOT NULL",
        "created_at timestamp with time zone NOT NULL",
        "description text NOT NULL",
        "expected_answer text",
        "grading_rules jsonb NOT NULL",
        "id uuid NOT NULL",
        "level text NOT NULL",
        "subject text NOT NULL",
        "subject_id uuid",
        "theme text",
        "title text NOT NULL",
        "type text NOT NULL",
        "updated_at timestamp with time zone NOT NULL"
      ],
      "relacoes": [
        "subject_id -> subjects.id"
      ]
    },
    {
      "table_name": "reference_texts",
      "colunas": [
        "active boolean",
        "category text",
        "content text NOT NULL",
        "created_at timestamp with time zone",
        "id uuid NOT NULL",
        "metadata jsonb",
        "source text",
        "tags ARRAY"
      ],
      "relacoes": null
    },
    {
      "table_name": "schools",
      "colunas": [
        "city_id uuid NOT NULL",
        "id uuid NOT NULL",
        "name text NOT NULL"
      ],
      "relacoes": [
        "city_id -> cities.id"
      ]
    },
    {
      "table_name": "student_class_enrollments",
      "colunas": [
        "ano text",
        "class_id uuid NOT NULL",
        "education_level_id uuid NOT NULL",
        "grade_id uuid NOT NULL",
        "id uuid NOT NULL",
        "school_id uuid",
        "student_id uuid NOT NULL"
      ],
      "relacoes": [
        "class_id -> classes.id",
        "education_level_id -> education_levels.id",
        "grade_id -> grades.id",
        "school_id -> schools.id",
        "student_id -> students.id"
      ]
    },
    {
      "table_name": "student_curriculums",
      "colunas": [
        "created_at timestamp with time zone NOT NULL",
        "curriculum_id uuid NOT NULL",
        "enrollment_id uuid NOT NULL",
        "id uuid NOT NULL",
        "status text NOT NULL",
        "teacher_id uuid NOT NULL"
      ],
      "relacoes": [
        "curriculum_id -> curriculums.id",
        "enrollment_id -> student_class_enrollments.id",
        "teacher_id -> teachers.id"
      ]
    },
    {
      "table_name": "student_responses",
      "colunas": [
        "answer text NOT NULL",
        "created_at timestamp with time zone",
        "id uuid NOT NULL",
        "question_id uuid NOT NULL",
        "student_id uuid NOT NULL"
      ],
      "relacoes": [
        "question_id -> questions.id",
        "student_id -> students.id"
      ]
    },
    {
      "table_name": "students",
      "colunas": [
        "email text NOT NULL",
        "id uuid NOT NULL",
        "name text NOT NULL"
      ],
      "relacoes": null
    },
    {
      "table_name": "subjects",
      "colunas": [
        "created_at timestamp with time zone",
        "id uuid NOT NULL",
        "name text NOT NULL"
      ],
      "relacoes": null
    },
    {
      "table_name": "system_settings",
      "colunas": [
        "description text",
        "id text NOT NULL",
        "name text NOT NULL",
        "updated_at timestamp with time zone",
        "updated_by text",
        "value jsonb NOT NULL"
      ],
      "relacoes": null
    },
    {
      "table_name": "table_name",
      "colunas": [
        "data jsonb",
        "id bigint NOT NULL",
        "inserted_at timestamp with time zone NOT NULL",
        "name text",
        "updated_at timestamp with time zone NOT NULL"
      ],
      "relacoes": null
    },
    {
      "table_name": "teacher_subjects",
      "colunas": [
        "created_at timestamp with time zone NOT NULL",
        "id uuid NOT NULL",
        "subject_id uuid NOT NULL",
        "teacher_id uuid NOT NULL"
      ],
      "relacoes": [
        "subject_id -> subjects.id",
        "teacher_id -> teachers.id"
      ]
    },
    {
      "table_name": "teachers",
      "colunas": [
        "created_at timestamp with time zone",
        "email text NOT NULL",
        "id uuid NOT NULL",
        "name text NOT NULL"
      ],
      "relacoes": null
    }
  ]