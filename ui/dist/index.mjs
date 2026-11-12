import { jsxs as o, jsx as e, Fragment as ne } from "react/jsx-runtime";
import { useState as m, useMemo as D, useEffect as z, useCallback as re } from "react";
import { ExternalLink as H, ArrowRight as xe, CheckCircle2 as se, Trash2 as le, ChevronLeft as he, ChevronRight as fe, Plus as B, Circle as ge, X as ve, Loader2 as Ne, FolderGit2 as we, Search as ye, Columns as je, RefreshCw as Ce, AlertCircle as ke } from "lucide-react";
import { useAppApi as Se } from "@kirocrew/app-sdk";
const _e = ["done", "completed", "concluído", "concluido", "closed"];
function V(a) {
  return a ? _e.includes(a.trim().toLowerCase()) : !1;
}
function de(a) {
  const l = a.find((d) => V(d.name));
  return (l == null ? void 0 : l.name) || "Done";
}
function I(a) {
  if (!a) return "";
  try {
    return a.replace(/\\u([0-9a-fA-F]{4})/g, (l, d) => String.fromCharCode(parseInt(d, 16)));
  } catch {
    return a;
  }
}
function Te({ task: a, statusOptions: l, onMoveStatus: d, onDelete: i }) {
  const [f, c] = m(!1), N = V(a.status), h = de(l);
  return /* @__PURE__ */ o("div", { className: "group relative flex flex-col gap-2 p-3 rounded-lg bg-bg border border-border hover:border-border-strong hover:shadow-md transition-all", children: [
    /* @__PURE__ */ o("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ e("span", { className: "text-xs font-semibold leading-snug line-clamp-2 text-text", children: I(a.title) }),
      a.url && /* @__PURE__ */ e(
        "a",
        {
          href: a.url,
          target: "_blank",
          rel: "noreferrer",
          className: "text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0",
          title: "Abrir no GitHub",
          children: /* @__PURE__ */ e(H, { size: 12 })
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { className: "flex items-center justify-between text-[11px] text-muted pt-1", children: [
      /* @__PURE__ */ o("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
        a.number ? /* @__PURE__ */ o("span", { className: "font-mono text-muted/80", children: [
          "#",
          a.number
        ] }) : /* @__PURE__ */ e("span", { className: "text-[10px] bg-border px-1.5 py-0.2 rounded font-mono font-medium", children: "DRAFT" }),
        a.repository && /* @__PURE__ */ e("span", { className: "text-muted/60 text-[10px] truncate max-w-[130px]", children: a.repository })
      ] }),
      /* @__PURE__ */ o("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ o("div", { className: "relative", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => c(!f),
              className: "p-1 rounded hover:bg-border text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-all",
              title: "Mover para outro status",
              children: /* @__PURE__ */ e(xe, { size: 13 })
            }
          ),
          f && /* @__PURE__ */ o(ne, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: "fixed inset-0 z-30",
                onClick: () => c(!1)
              }
            ),
            /* @__PURE__ */ o("div", { className: "absolute right-0 bottom-full mb-1 z-40 min-w-[180px] bg-surface border border-border rounded-lg shadow-xl py-1 text-xs animate-in fade-in zoom-in-95", children: [
              /* @__PURE__ */ e("div", { className: "px-2.5 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider border-b border-border/50", children: "Mover tarefa para:" }),
              /* @__PURE__ */ e("div", { className: "max-h-48 overflow-y-auto py-0.5", children: l.map((p) => /* @__PURE__ */ e(
                "button",
                {
                  onClick: () => {
                    c(!1), p.name !== a.status && d(a.id, p.name);
                  },
                  className: `w-full text-left px-2.5 py-1.5 hover:bg-border transition-colors truncate ${p.name === a.status ? "text-accent font-semibold" : "text-text"}`,
                  children: p.name
                },
                p.id
              )) })
            ] })
          ] })
        ] }),
        !N && /* @__PURE__ */ e(
          "button",
          {
            onClick: () => d(a.id, h),
            title: "Concluir tarefa (Done)",
            className: "opacity-0 group-hover:opacity-100 hover:text-emerald-400 text-muted transition-all p-1",
            children: /* @__PURE__ */ e(se, { size: 13 })
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => {
              window.confirm(`Deseja realmente excluir a tarefa "${I(a.title)}"?`) && i(a.id);
            },
            title: "Excluir do projeto",
            className: "opacity-0 group-hover:opacity-100 hover:text-red-400 text-muted transition-all p-1",
            children: /* @__PURE__ */ e(le, { size: 13 })
          }
        )
      ] })
    ] })
  ] });
}
const ze = {
  backlog: { bg: "bg-zinc-500/10", dot: "bg-zinc-400", border: "border-zinc-500/20" },
  "to do": { bg: "bg-amber-500/10", dot: "bg-amber-500", border: "border-amber-500/20" },
  todo: { bg: "bg-amber-500/10", dot: "bg-amber-500", border: "border-amber-500/20" },
  "in progress": { bg: "bg-blue-500/10", dot: "bg-blue-500", border: "border-blue-500/20" },
  execucao: { bg: "bg-blue-500/10", dot: "bg-blue-500", border: "border-blue-500/20" },
  revisao: { bg: "bg-purple-500/10", dot: "bg-purple-500", border: "border-purple-500/20" },
  review: { bg: "bg-purple-500/10", dot: "bg-purple-500", border: "border-purple-500/20" },
  testes: { bg: "bg-cyan-500/10", dot: "bg-cyan-500", border: "border-cyan-500/20" },
  done: { bg: "bg-emerald-500/10", dot: "bg-emerald-500", border: "border-emerald-500/20" },
  completed: { bg: "bg-emerald-500/10", dot: "bg-emerald-500", border: "border-emerald-500/20" },
  freeze: { bg: "bg-slate-500/10", dot: "bg-slate-400", border: "border-slate-500/20" }
};
function Ae({
  tasks: a,
  statusOptions: l,
  columnCount: d,
  activeColIndex: i,
  onColIndexChange: f,
  onMoveStatus: c,
  onDelete: N,
  onOpenCreate: h
}) {
  const p = D(() => {
    const s = /* @__PURE__ */ new Map();
    return l.forEach((u) => s.set(u.name, [])), a.forEach((u) => {
      const b = u.status || "No Status";
      s.has(b) || s.set(b, []), s.get(b).push(u);
    }), Array.from(s.entries()).map(([u, b]) => ({
      name: u,
      items: b,
      count: b.length
    }));
  }, [a, l]), k = D(() => {
    if (p.length === 0) return [];
    if (d === "all") return p;
    const s = Math.max(1, parseInt(d, 10) || 1), u = Math.min(i, Math.max(0, p.length - s));
    return p.slice(u, u + s);
  }, [p, d, i]), C = i > 0, y = d !== "all" && i + (parseInt(d, 10) || 1) < p.length, S = (s) => {
    const u = s.toLowerCase();
    for (const [b, v] of Object.entries(ze))
      if (u.includes(b)) return v;
    return { bg: "bg-muted/10", dot: "bg-muted", border: "border-border" };
  };
  return /* @__PURE__ */ o("div", { className: "flex flex-col gap-3 h-full", children: [
    d !== "all" && p.length > 1 && /* @__PURE__ */ o("div", { className: "flex items-center justify-between px-1 select-none", children: [
      /* @__PURE__ */ o("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ e(
          "button",
          {
            disabled: !C,
            onClick: () => f(Math.max(0, i - 1)),
            className: "p-1 rounded-md border border-border hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-muted hover:text-text transition-all",
            title: "Coluna anterior",
            children: /* @__PURE__ */ e(he, { size: 14 })
          }
        ),
        /* @__PURE__ */ o("span", { className: "text-xs text-muted font-medium", children: [
          "Coluna ",
          i + 1,
          " de ",
          p.length
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            disabled: !y,
            onClick: () => f(i + 1),
            className: "p-1 rounded-md border border-border hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-muted hover:text-text transition-all",
            title: "Próxima coluna",
            children: /* @__PURE__ */ e(fe, { size: 14 })
          }
        )
      ] }),
      /* @__PURE__ */ e("div", { className: "hidden sm:flex items-center gap-1 overflow-x-auto max-w-[60%] py-0.5", children: p.map((s, u) => /* @__PURE__ */ o(
        "button",
        {
          onClick: () => f(u),
          className: `px-2 py-0.5 rounded text-[10px] font-semibold transition-all whitespace-nowrap ${u === i ? "bg-accent text-accent-text" : "bg-surface border border-border text-muted hover:text-text"}`,
          children: [
            s.name,
            " (",
            s.count,
            ")"
          ]
        },
        s.name
      )) })
    ] }),
    /* @__PURE__ */ e("div", { className: "flex items-start gap-3 flex-1 overflow-x-auto pb-4", children: k.map((s) => {
      const u = S(s.name), b = d === "1";
      return /* @__PURE__ */ o(
        "div",
        {
          className: `flex flex-col rounded-xl bg-surface/90 border ${u.border} overflow-hidden shadow-xs flex-shrink-0 transition-all ${b ? "w-full min-w-0" : "w-[290px] sm:w-[320px]"}`,
          children: [
            /* @__PURE__ */ o("div", { className: "flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-bg/50 select-none", children: [
              /* @__PURE__ */ o("div", { className: "flex items-center gap-2 truncate", children: [
                /* @__PURE__ */ e("span", { className: `w-2.5 h-2.5 rounded-full shrink-0 ${u.dot}` }),
                /* @__PURE__ */ e("span", { className: "font-semibold text-xs tracking-tight uppercase truncate", children: s.name })
              ] }),
              /* @__PURE__ */ o("div", { className: "flex items-center gap-1.5 shrink-0", children: [
                /* @__PURE__ */ e("span", { className: "px-2 py-0.5 rounded-full bg-border/80 text-[11px] font-bold text-muted", children: s.count }),
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => h(s.name),
                    className: "p-1 rounded text-muted hover:text-text hover:bg-border transition-colors",
                    title: `Adicionar tarefa em ${s.name}`,
                    children: /* @__PURE__ */ e(B, { size: 13 })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ e("div", { className: "flex flex-col gap-2 p-2.5 max-h-[calc(100vh-250px)] min-h-[140px] overflow-y-auto", children: s.items.length === 0 ? /* @__PURE__ */ o("div", { className: "flex flex-col items-center justify-center p-6 text-muted text-xs border border-dashed border-border/80 rounded-lg text-center", children: [
              /* @__PURE__ */ e("span", { children: "Sem tarefas nesta coluna" }),
              /* @__PURE__ */ e(
                "button",
                {
                  onClick: () => h(s.name),
                  className: "mt-2 text-accent hover:underline text-[11px] font-medium",
                  children: "+ Criar tarefa aqui"
                }
              )
            ] }) : s.items.map((v) => /* @__PURE__ */ e(
              Te,
              {
                task: v,
                statusOptions: l,
                onMoveStatus: c,
                onDelete: N
              },
              v.id
            )) })
          ]
        },
        s.name
      );
    }) })
  ] });
}
function Ee({ tasks: a, statusOptions: l, onMoveStatus: d, onDelete: i }) {
  if (a.length === 0)
    return /* @__PURE__ */ e("div", { className: "flex flex-col items-center justify-center p-12 text-muted text-xs border border-dashed border-border rounded-xl", children: "Nenhuma tarefa encontrada com os filtros atuais." });
  const f = de(l);
  return /* @__PURE__ */ e("div", { className: "w-full bg-surface border border-border rounded-xl overflow-hidden shadow-xs text-xs flex flex-col max-h-[calc(100vh-170px)]", children: /* @__PURE__ */ e("div", { className: "overflow-x-auto overflow-y-auto flex-1", children: /* @__PURE__ */ o("table", { className: "w-full text-left border-collapse", children: [
    /* @__PURE__ */ e("thead", { className: "sticky top-0 bg-surface border-b border-border z-10", children: /* @__PURE__ */ o("tr", { className: "text-muted font-semibold select-none bg-bg/80", children: [
      /* @__PURE__ */ e("th", { className: "p-3 w-1/2", children: "Título" }),
      /* @__PURE__ */ e("th", { className: "p-3 w-48", children: "Status" }),
      /* @__PURE__ */ e("th", { className: "p-3 w-40", children: "Repositório" }),
      /* @__PURE__ */ e("th", { className: "p-3 text-right w-28", children: "Ações" })
    ] }) }),
    /* @__PURE__ */ e("tbody", { className: "divide-y divide-border/60", children: a.map((c) => {
      const N = V(c.status);
      return /* @__PURE__ */ o("tr", { className: "hover:bg-bg/40 transition-colors group", children: [
        /* @__PURE__ */ e("td", { className: "p-3 font-medium text-text", children: /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
          N ? /* @__PURE__ */ e(se, { size: 15, className: "text-emerald-500 shrink-0" }) : /* @__PURE__ */ e(ge, { size: 15, className: "text-muted shrink-0" }),
          /* @__PURE__ */ e("span", { className: "font-semibold text-xs leading-relaxed", children: I(c.title) }),
          c.number && /* @__PURE__ */ o("span", { className: "font-mono text-[10px] text-muted shrink-0", children: [
            "#",
            c.number
          ] }),
          c.url && /* @__PURE__ */ e(
            "a",
            {
              href: c.url,
              target: "_blank",
              rel: "noreferrer",
              className: "text-muted hover:text-text p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
              title: "Abrir no GitHub",
              children: /* @__PURE__ */ e(H, { size: 12 })
            }
          )
        ] }) }),
        /* @__PURE__ */ e("td", { className: "p-3", children: /* @__PURE__ */ e(
          "select",
          {
            value: c.status,
            onChange: (h) => d(c.id, h.target.value),
            className: "bg-bg border border-border rounded-lg px-2 py-1 text-[11px] text-text font-medium focus:outline-none focus:border-accent cursor-pointer max-w-[180px] truncate",
            children: l.map((h) => /* @__PURE__ */ e("option", { value: h.name, children: h.name }, h.id))
          }
        ) }),
        /* @__PURE__ */ e("td", { className: "p-3 text-muted", children: c.repository ? /* @__PURE__ */ e("span", { className: "font-mono text-[11px] truncate block max-w-[160px]", children: c.repository }) : /* @__PURE__ */ e("span", { className: "text-muted/50", children: "-" }) }),
        /* @__PURE__ */ e("td", { className: "p-3 text-right", children: /* @__PURE__ */ o("div", { className: "flex items-center justify-end gap-1.5", children: [
          !N && /* @__PURE__ */ e(
            "button",
            {
              onClick: () => d(c.id, f),
              className: "px-2.5 py-1 bg-surface border border-border hover:bg-border text-text rounded-md text-[11px] font-medium transition-all",
              children: "Concluir"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => {
                window.confirm(`Deseja excluir a tarefa "${I(c.title)}"?`) && i(c.id);
              },
              className: "p-1 rounded text-muted hover:text-red-400 hover:bg-border transition-all",
              title: "Excluir tarefa",
              children: /* @__PURE__ */ e(le, { size: 13 })
            }
          )
        ] }) })
      ] }, c.id);
    }) })
  ] }) }) });
}
function Le({
  isOpen: a,
  onClose: l,
  statusOptions: d,
  initialStatus: i,
  onSubmit: f
}) {
  var v;
  const [c, N] = m(""), [h, p] = m(""), [k, C] = m(i || (((v = d[0]) == null ? void 0 : v.name) ?? "Todo")), [y, S] = m(!1), [s, u] = m(null);
  return z(() => {
    if (i)
      C(i);
    else if (d.length > 0) {
      const x = d.find((w) => w.name.toLowerCase().includes("to do") || w.name.toLowerCase().includes("todo")) || d[0];
      C(x.name);
    }
  }, [i, d]), z(() => {
    const x = (w) => {
      w.key === "Escape" && a && l();
    };
    return window.addEventListener("keydown", x), () => window.removeEventListener("keydown", x);
  }, [a, l]), a ? /* @__PURE__ */ e("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4", children: /* @__PURE__ */ o("div", { className: "w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150", children: [
    /* @__PURE__ */ o("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border bg-bg/80", children: [
      /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e(B, { size: 16, className: "text-accent" }),
        /* @__PURE__ */ e("span", { className: "font-semibold text-sm text-text", children: "Nova Tarefa no GitHub Project" })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: l,
          className: "text-muted hover:text-text p-1 rounded-md transition-colors",
          children: /* @__PURE__ */ e(ve, { size: 15 })
        }
      )
    ] }),
    /* @__PURE__ */ o("form", { onSubmit: async (x) => {
      if (x.preventDefault(), !!c.trim()) {
        S(!0), u(null);
        try {
          await f(c.trim(), h.trim(), k), N(""), p(""), l();
        } catch (w) {
          u((w == null ? void 0 : w.message) || "Erro ao criar tarefa no GitHub Projects.");
        } finally {
          S(!1);
        }
      }
    }, className: "flex flex-col gap-3.5 p-4 text-xs", children: [
      s && /* @__PURE__ */ e("div", { className: "p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs", children: s }),
      /* @__PURE__ */ o("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ e("label", { className: "font-medium text-muted", children: "Título da Tarefa *" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            required: !0,
            autoFocus: !0,
            placeholder: "Ex: [FEAT-101] Implementar filtro por milestone",
            value: c,
            onChange: (x) => N(x.target.value),
            className: "bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors"
          }
        )
      ] }),
      /* @__PURE__ */ o("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ e("label", { className: "font-medium text-muted", children: "Descrição (opcional)" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            rows: 3,
            placeholder: "Critérios de aceitação, contexto ou detalhes da task...",
            value: h,
            onChange: (x) => p(x.target.value),
            className: "bg-bg border border-border rounded-lg p-2.5 text-xs text-text focus:outline-none focus:border-accent resize-none transition-colors"
          }
        )
      ] }),
      /* @__PURE__ */ o("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ e("label", { className: "font-medium text-muted", children: "Coluna / Status Inicial" }),
        /* @__PURE__ */ e(
          "select",
          {
            value: k,
            onChange: (x) => C(x.target.value),
            className: "bg-bg border border-border rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent cursor-pointer",
            children: d.map((x) => /* @__PURE__ */ e("option", { value: x.name, children: x.name }, x.id))
          }
        )
      ] }),
      /* @__PURE__ */ o("div", { className: "flex items-center justify-end gap-2 pt-2 border-t border-border mt-2", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: l,
            disabled: y,
            className: "px-3 py-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface font-medium transition-all",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ o(
          "button",
          {
            type: "submit",
            disabled: y || !c.trim(),
            className: "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-accent-text hover:opacity-90 font-medium transition-all disabled:opacity-50",
            children: [
              y && /* @__PURE__ */ e(Ne, { size: 13, className: "animate-spin" }),
              /* @__PURE__ */ e("span", { children: y ? "Criando..." : "Criar Tarefa" })
            ]
          }
        )
      ] })
    ] })
  ] }) }) : null;
}
function De({ count: a = 3 }) {
  return /* @__PURE__ */ e("div", { className: "flex items-start gap-3 w-full overflow-x-hidden animate-pulse", children: Array.from({ length: a }).map((l, d) => /* @__PURE__ */ o(
    "div",
    {
      className: "flex flex-col w-[300px] shrink-0 rounded-xl bg-surface/60 border border-border/60 overflow-hidden p-3 gap-3",
      children: [
        /* @__PURE__ */ o("div", { className: "flex items-center justify-between pb-2 border-b border-border/40", children: [
          /* @__PURE__ */ e("div", { className: "h-4 w-28 bg-border/80 rounded" }),
          /* @__PURE__ */ e("div", { className: "h-4 w-6 bg-border/60 rounded-full" })
        ] }),
        /* @__PURE__ */ o("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ o("div", { className: "h-20 bg-bg/80 border border-border/40 rounded-lg p-3 flex flex-col justify-between", children: [
            /* @__PURE__ */ e("div", { className: "h-3 w-full bg-border/60 rounded" }),
            /* @__PURE__ */ e("div", { className: "h-3 w-3/4 bg-border/40 rounded" }),
            /* @__PURE__ */ o("div", { className: "flex justify-between items-center pt-2", children: [
              /* @__PURE__ */ e("div", { className: "h-2.5 w-12 bg-border/60 rounded" }),
              /* @__PURE__ */ e("div", { className: "h-2.5 w-16 bg-border/40 rounded" })
            ] })
          ] }),
          /* @__PURE__ */ o("div", { className: "h-20 bg-bg/80 border border-border/40 rounded-lg p-3 flex flex-col justify-between", children: [
            /* @__PURE__ */ e("div", { className: "h-3 w-5/6 bg-border/60 rounded" }),
            /* @__PURE__ */ e("div", { className: "h-3 w-1/2 bg-border/40 rounded" }),
            /* @__PURE__ */ o("div", { className: "flex justify-between items-center pt-2", children: [
              /* @__PURE__ */ e("div", { className: "h-2.5 w-12 bg-border/60 rounded" }),
              /* @__PURE__ */ e("div", { className: "h-2.5 w-16 bg-border/40 rounded" })
            ] })
          ] }),
          /* @__PURE__ */ o("div", { className: "h-20 bg-bg/80 border border-border/40 rounded-lg p-3 flex flex-col justify-between", children: [
            /* @__PURE__ */ e("div", { className: "h-3 w-4/5 bg-border/60 rounded" }),
            /* @__PURE__ */ e("div", { className: "h-3 w-2/3 bg-border/40 rounded" }),
            /* @__PURE__ */ o("div", { className: "flex justify-between items-center pt-2", children: [
              /* @__PURE__ */ e("div", { className: "h-2.5 w-12 bg-border/60 rounded" }),
              /* @__PURE__ */ e("div", { className: "h-2.5 w-16 bg-border/40 rounded" })
            ] })
          ] })
        ] })
      ]
    },
    d
  )) });
}
const oe = "", U = 0, ae = [
  "backlog",
  "to do",
  "todo",
  "1. execução de tasks",
  "in progress",
  "2. correção e revisão de código",
  "review",
  "3. testes, playground e documentação",
  "done",
  "completed",
  "freeze"
];
function Re() {
  const a = Se(), [l, d] = m(() => {
    try {
      return localStorage.getItem("kiro_gh_owner") || oe;
    } catch {
      return oe;
    }
  }), [i, f] = m(() => {
    try {
      const t = localStorage.getItem("kiro_gh_project_num"), r = t ? parseInt(t, 10) : U;
      return Number.isFinite(r) && r > 0 ? r : U;
    } catch {
      return U;
    }
  }), [c, N] = m(() => {
    try {
      return localStorage.getItem("kiro_gh_subview") || "board";
    } catch {
      return "board";
    }
  }), [h, p] = m(() => {
    try {
      return localStorage.getItem("kiro_gh_col_count") || "all";
    } catch {
      return "all";
    }
  }), [k, C] = m(0), [y, S] = m([]), [s, u] = m(""), [b, v] = m([]), [x, w] = m([]), [ie, T] = m("GitHub Projects"), [q, A] = m(""), [P, K] = m(!0), [Q, M] = m(null), [ce, $] = m(!1), [ue, W] = m(), J = (t) => {
    f(t);
    try {
      localStorage.setItem("kiro_gh_project_num", String(t));
    } catch {
    }
    const r = y.find((n) => n.number === t);
    r && T(r.title);
  }, X = (t) => {
    N(t);
    try {
      localStorage.setItem("kiro_gh_subview", t);
    } catch {
    }
  }, me = (t) => {
    p(t);
    try {
      localStorage.setItem("kiro_gh_col_count", t);
    } catch {
    }
  }, [_, E] = m(l);
  z(() => {
    const t = l.trim();
    if (!t) {
      E("");
      return;
    }
    const r = setTimeout(() => {
      E(t);
      try {
        localStorage.setItem("kiro_gh_owner", t);
      } catch {
      }
    }, 350);
    return () => clearTimeout(r);
  }, [l]);
  const Y = re(async () => {
    try {
      const t = await a.get(`/apps/github-projects/api/projects?owner=${encodeURIComponent(_)}`);
      if (t && t.ok && Array.isArray(t.projects)) {
        if (S(t.projects), !_ && (t != null && t.owner)) {
          d(t.owner), E(t.owner);
          try {
            localStorage.setItem("kiro_gh_owner", t.owner);
          } catch {
          }
        }
        const r = t.projects.find((n) => n.number === i);
        if (r)
          T(r.title), r.url && A(r.url);
        else {
          const n = t.projects[0];
          n ? (f(n.number), T(n.title), n.url && A(n.url)) : (A(""), T("Nenhum projeto encontrado"));
        }
      }
    } catch (t) {
      console.warn("Erro ao listar projetos disponíveis:", t);
    }
  }, [a, _, i]), L = re(async () => {
    var t;
    K(!0), M(null);
    try {
      const r = await a.post("/apps/github-projects/api/tasks", {
        owner: _,
        project_number: i,
        limit: 300
      });
      if (r && r.ok && Array.isArray(r.tasks)) {
        if (!_ && (r != null && r.owner)) {
          d(r.owner), E(r.owner);
          try {
            localStorage.setItem("kiro_gh_owner", r.owner);
          } catch {
          }
        }
        if (v(r.tasks), r.project) {
          r.project.title && T(r.project.title), r.project.url && A(r.project.url), i <= 0 && r.project.number && f(r.project.number);
          const n = (t = r.project.status_fields) == null ? void 0 : t.find(
            (g) => {
              var j;
              return g.name.toLowerCase() === "status" || ((j = g.options) == null ? void 0 : j.length) > 0;
            }
          );
          n && Array.isArray(n.options) && n.options.length > 0 && w(n.options);
        } else
          w([]);
      } else
        M((r == null ? void 0 : r.error) || "Nenhuma tarefa encontrada.");
    } catch (r) {
      M((r == null ? void 0 : r.message) || "Falha ao conectar com o backend do GitHub Projects.");
    } finally {
      K(!1);
    }
  }, [a, _, i]);
  z(() => {
    Y();
  }, [Y]), z(() => {
    L();
  }, [L]);
  const R = D(() => {
    if (x.length > 0) return x;
    const t = /* @__PURE__ */ new Set();
    b.forEach((n) => {
      n.status && t.add(n.status);
    });
    const r = Array.from(t).map((n) => ({ id: n, name: n }));
    return r.sort((n, g) => {
      const j = n.name.toLowerCase(), pe = g.name.toLowerCase(), F = ae.findIndex((O) => j.includes(O)), G = ae.findIndex((O) => pe.includes(O));
      return F !== -1 && G !== -1 ? F - G : F !== -1 ? -1 : G !== -1 ? 1 : n.name.localeCompare(g.name);
    }), r.length > 0 ? r : [
      { id: "todo", name: "Todo" },
      { id: "in_progress", name: "In Progress" },
      { id: "done", name: "Done" }
    ];
  }, [x, b]), Z = D(() => {
    if (!s.trim()) return b;
    const t = s.toLowerCase();
    return b.filter(
      (r) => r.title.toLowerCase().includes(t) || r.number && String(r.number).includes(t) || r.repository && r.repository.toLowerCase().includes(t) || r.status && r.status.toLowerCase().includes(t)
    );
  }, [b, s]), ee = async (t, r) => {
    const n = [...b];
    v(
      (g) => g.map((j) => j.id === t ? { ...j, status: r } : j)
    );
    try {
      await a.post("/apps/github-projects/api/task/update-status", {
        owner: l,
        project_number: i,
        item_id: t,
        status: r
      });
    } catch (g) {
      alert(`Falha ao mover tarefa: ${(g == null ? void 0 : g.message) || g}`), v(n);
    }
  }, te = async (t) => {
    const r = [...b];
    v((n) => n.filter((g) => g.id !== t));
    try {
      await a.post("/apps/github-projects/api/task/delete", {
        owner: l,
        project_number: i,
        item_id: t
      });
    } catch (n) {
      alert(`Falha ao excluir tarefa: ${(n == null ? void 0 : n.message) || n}`), v(r);
    }
  }, be = async (t, r, n) => {
    await a.post("/apps/github-projects/api/task/create", {
      owner: l,
      project_number: i,
      title: t,
      body: r,
      status: n
    }), await L();
  };
  return /* @__PURE__ */ o("div", { className: "flex flex-col h-full w-full bg-surface text-text select-none overflow-hidden", children: [
    /* @__PURE__ */ o("header", { className: "flex flex-wrap items-center justify-between gap-2.5 border-b border-border bg-bg/70 px-4 py-2.5 text-xs min-h-[52px]", children: [
      /* @__PURE__ */ o("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e("div", { className: "p-1.5 rounded-lg bg-accent/10 text-accent", children: /* @__PURE__ */ e(we, { size: 16 }) }),
          /* @__PURE__ */ e("span", { className: "font-bold text-sm tracking-tight text-text", children: "GitHub Projects" })
        ] }),
        /* @__PURE__ */ e("div", { className: "h-4 w-[1px] bg-border hidden sm:block" }),
        /* @__PURE__ */ o("div", { className: "flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2.5 py-1 text-xs shadow-2xs", children: [
          y.length > 0 ? /* @__PURE__ */ e(
            "select",
            {
              id: "project-selector",
              value: i,
              onChange: (t) => J(parseInt(t.target.value, 10)),
              className: "bg-transparent border-none text-text font-semibold focus:outline-none cursor-pointer pr-1",
              children: y.map((t) => /* @__PURE__ */ o("option", { value: t.number, children: [
                t.owner,
                " / ",
                t.title,
                " #",
                t.number
              ] }, t.id || t.number))
            }
          ) : /* @__PURE__ */ o(ne, { children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                value: l,
                onChange: (t) => d(t.target.value),
                className: "bg-transparent border-none w-16 text-text font-semibold focus:outline-none",
                title: "Owner"
              }
            ),
            /* @__PURE__ */ e("span", { className: "text-muted", children: "/" }),
            /* @__PURE__ */ e("span", { className: "font-semibold text-text truncate max-w-[140px]", children: ie }),
            /* @__PURE__ */ e("span", { className: "text-muted", children: "#" }),
            /* @__PURE__ */ e(
              "input",
              {
                type: "number",
                value: i,
                onChange: (t) => J(parseInt(t.target.value, 10) || 1),
                className: "bg-transparent border-none w-8 text-muted focus:outline-none",
                title: "Número do projeto"
              }
            )
          ] }),
          /* @__PURE__ */ e("span", { className: "px-2 py-0.5 rounded-md bg-border text-[11px] font-bold text-muted ml-1", title: "Total de tarefas no projeto", children: b.length }),
          (q || l && i > 0) && /* @__PURE__ */ e(
            "a",
            {
              href: q || `https://github.com/users/${l}/projects/${i}`,
              target: "_blank",
              rel: "noreferrer",
              className: "text-muted hover:text-text p-0.5 ml-0.5",
              title: "Abrir projeto no GitHub",
              children: /* @__PURE__ */ e(H, { size: 12 })
            }
          )
        ] }),
        /* @__PURE__ */ o("div", { className: "flex items-center border border-border rounded-lg overflow-hidden bg-bg/50 shadow-2xs", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => X("board"),
              className: `px-3 py-1 font-semibold transition-all ${c === "board" ? "bg-border text-text shadow-xs" : "text-muted hover:text-text"}`,
              children: "BOARD"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => X("table"),
              className: `px-3 py-1 font-semibold transition-all ${c === "table" ? "bg-border text-text shadow-xs" : "text-muted hover:text-text"}`,
              children: "TABELA issue"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ o("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ o("div", { className: "relative flex items-center", children: [
          /* @__PURE__ */ e(ye, { size: 13, className: "absolute left-2.5 text-muted pointer-events-none" }),
          /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              placeholder: "Busca de tarefas...",
              value: s,
              onChange: (t) => u(t.target.value),
              className: "bg-bg border border-border rounded-lg pl-7 pr-2.5 py-1 text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-accent w-36 sm:w-48 transition-all"
            }
          )
        ] }),
        c === "board" && /* @__PURE__ */ o("div", { className: "flex items-center gap-1 bg-bg border border-border rounded-lg px-2 py-0.5 shadow-2xs", children: [
          /* @__PURE__ */ e(je, { size: 12, className: "text-muted" }),
          /* @__PURE__ */ o(
            "select",
            {
              id: "column-count-selector",
              value: h,
              onChange: (t) => me(t.target.value),
              className: "bg-transparent text-xs text-text border-none focus:outline-none cursor-pointer pr-1",
              title: "Colunas visíveis simultâneas",
              children: [
                /* @__PURE__ */ e("option", { value: "1", children: "1 Coluna" }),
                /* @__PURE__ */ e("option", { value: "2", children: "2 Colunas" }),
                /* @__PURE__ */ e("option", { value: "3", children: "3 Colunas" }),
                /* @__PURE__ */ e("option", { value: "4", children: "4 Colunas" }),
                /* @__PURE__ */ e("option", { value: "all", children: "Todas" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ o(
          "button",
          {
            onClick: () => {
              W(void 0), $(!0);
            },
            className: "flex items-center gap-1.5 bg-accent text-accent-text hover:opacity-90 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs",
            children: [
              /* @__PURE__ */ e(B, { size: 13 }),
              /* @__PURE__ */ e("span", { children: "Nova Task" })
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: L,
            disabled: P,
            className: "p-1.5 rounded-lg border border-border hover:bg-surface text-muted hover:text-text transition-all",
            title: "Atualizar tarefas",
            children: /* @__PURE__ */ e(Ce, { size: 13, className: P ? "animate-spin text-accent" : "" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ o("main", { className: "flex-1 overflow-x-auto overflow-y-auto p-4 bg-bg/40 min-h-0", children: [
      Q && /* @__PURE__ */ o("div", { className: "flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs mb-4", children: [
        /* @__PURE__ */ e(ke, { size: 15 }),
        /* @__PURE__ */ e("span", { children: Q })
      ] }),
      P && b.length === 0 ? /* @__PURE__ */ e(De, { count: h === "1" ? 1 : 4 }) : c === "table" ? /* @__PURE__ */ e(
        Ee,
        {
          tasks: Z,
          statusOptions: R,
          onMoveStatus: ee,
          onDelete: te
        }
      ) : /* @__PURE__ */ e(
        Ae,
        {
          tasks: Z,
          statusOptions: R,
          columnCount: h,
          activeColIndex: k,
          onColIndexChange: C,
          onMoveStatus: ee,
          onDelete: te,
          onOpenCreate: (t) => {
            W(t), $(!0);
          }
        }
      )
    ] }),
    /* @__PURE__ */ e(
      Le,
      {
        isOpen: ce,
        onClose: () => $(!1),
        statusOptions: R,
        initialStatus: ue,
        onSubmit: be
      }
    )
  ] });
}
export {
  Re as default
};
