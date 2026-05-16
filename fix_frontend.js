const fs = require('fs');
let code = fs.readFileSync('client/src/app/(professor)/professor/dashboard/plans/page.tsx', 'utf8');

code = code.replace(
  "import { Button } from '@/components/ui/Button';",
  "import { useForm } from 'react-hook-form';\nimport { Button } from '@/components/ui/Button';"
);

code = code.replace(
  "const [actioning, setActioning] = useState<string | null>(null);",
  "const [actioning, setActioning] = useState<string | null>(null);\n  const [editingPlan, setEditingPlan] = useState<string | null>(null);\n\n  const { register, handleSubmit, setValue, reset } = useForm<{ rationale: string }>({\n    defaultValues: {\n      rationale: ''\n    }\n  });"
);

code = code.replace(
  "const handleApproval = async (planId: string, status: 'approved' | 'rejected') => {",
  "const handleApproval = async (planId: string, status: 'approved' | 'rejected', customRationale?: string) => {"
);

code = code.replace(
  "body: JSON.stringify({ status }),",
  "body: JSON.stringify({ status, ...(customRationale && { aiRationale: customRationale }) }),"
);

code = code.replace(
  "fetchPlans();\n    } catch (error: any) {",
  "if (status === 'approved') {\n        setEditingPlan(null);\n      }\n      fetchPlans();\n    } catch (error: any) {"
);

code = code.replace(
  "setActioning(null);\n    }\n  };",
  "setActioning(null);\n    }\n  };\n\n  const handleEditClick = (plan: any) => {\n    setEditingPlan(plan.id);\n    setValue('rationale', plan.aiRationale || '');\n  };"
);

code = code.replace(
  "<p className=\"text-sm font-medium\">{plan.aiRationale || 'Sem racional especificado pela IA.'}</p>",
  `{editingPlan === plan.id ? (
                        <textarea
                           {...register('rationale')}
                           className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none text-sm"
                           rows={4}
                        />
                      ) : (
                        <p className="text-sm font-medium">{plan.aiRationale || 'Sem racional especificado pela IA.'}</p>
                      )}`
);

code = code.replace(
  "<Button variant=\"outline\" onClick={() => handleApproval(plan.id, 'rejected')} disabled={actioning === plan.id}>Rejeitar</Button>",
  `{editingPlan === plan.id ? (
                         <Button onClick={handleSubmit((data) => handleApproval(plan.id, 'approved', data.rationale))} disabled={actioning === plan.id}>Aprovar com Edição</Button>
                      ) : (
                         <Button variant="outline" onClick={() => handleEditClick(plan)}>Editar Racional</Button>
                      )}
                      <Button variant="outline" onClick={() => handleApproval(plan.id, 'rejected')} disabled={actioning === plan.id}>Rejeitar</Button>`
);

fs.writeFileSync('client/src/app/(professor)/professor/dashboard/plans/page.tsx', code);
