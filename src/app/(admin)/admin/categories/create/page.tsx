"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useGetCategoriesQuery,
  useCreateCategoryTreeMutation,
  CategoryTreeNode,
} from "@/lib/redux/features/categories/categoriesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

// ── Builder tree model ───────────────────────────────────────────────────────
interface BuilderNode {
  key: string;
  name: string;
  children: BuilderNode[];
}

let _uid = 0;
const makeNode = (): BuilderNode => ({ key: `node-${_uid++}`, name: "", children: [] });

const LEVEL_LABEL: Record<number, string> = {
  1: "Main Category",
  2: "Sub Category",
  3: "Product Group",
};

// Immutable helpers keyed by node.key.
const updateName = (nodes: BuilderNode[], key: string, name: string): BuilderNode[] =>
  nodes.map((n) =>
    n.key === key
      ? { ...n, name }
      : { ...n, children: updateName(n.children, key, name) }
  );

const addChild = (nodes: BuilderNode[], parentKey: string): BuilderNode[] =>
  nodes.map((n) =>
    n.key === parentKey
      ? { ...n, children: [...n.children, makeNode()] }
      : { ...n, children: addChild(n.children, parentKey) }
  );

const removeNode = (nodes: BuilderNode[], key: string): BuilderNode[] =>
  nodes
    .filter((n) => n.key !== key)
    .map((n) => ({ ...n, children: removeNode(n.children, key) }));

// Trim any descendants deeper than the current anchor allows.
const capDepth = (nodes: BuilderNode[], allowed: number): BuilderNode[] =>
  nodes.map((n) => ({
    ...n,
    children: allowed <= 0 ? [] : capDepth(n.children, allowed - 1),
  }));

const hasEmptyName = (nodes: BuilderNode[]): boolean =>
  nodes.some((n) => !n.name.trim() || hasEmptyName(n.children));

const countNodes = (nodes: BuilderNode[]): number =>
  nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);

const toPayload = (nodes: BuilderNode[]): CategoryTreeNode[] =>
  nodes.map((n) => {
    const children = toPayload(n.children);
    return children.length
      ? { name: n.name.trim(), children }
      : { name: n.name.trim() };
  });

// ── One editable row (recursive) ─────────────────────────────────────────────
function NodeEditor({
  node,
  level,
  onChange,
  onAddChild,
  onRemove,
}: {
  node: BuilderNode;
  level: number;
  onChange: (key: string, name: string) => void;
  onAddChild: (key: string) => void;
  onRemove: (key: string) => void;
}) {
  const canHaveChildren = level < 3;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="shrink-0 w-8 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          L{level}
        </span>
        <Input
          value={node.name}
          onChange={(e) => onChange(node.key, e.target.value)}
          placeholder={LEVEL_LABEL[level]}
          className="flex-1"
        />
        {canHaveChildren && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddChild(node.key)}
          >
            <Plus className="h-4 w-4 mr-1" />
            {LEVEL_LABEL[level + 1]}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(node.key)}
          className="text-primary"
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {node.children.length > 0 && (
        <div className="ml-4 border-l-2 border-gray-100 pl-4 space-y-2">
          {node.children.map((child) => (
            <NodeEditor
              key={child.key}
              node={child}
              level={level + 1}
              onChange={onChange}
              onAddChild={onAddChild}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CreateCategoryPage() {
  const router = useRouter();
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createTree, { isLoading }] = useCreateCategoryTreeMutation();

  const [mode, setMode] = useState<"new" | "existing">("new");
  const [parentId, setParentId] = useState<number | null>(null);
  const [roots, setRoots] = useState<BuilderNode[]>(() => [makeNode()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedParent =
    parentId != null
      ? categoriesData?.data.find((c) => c.id === parentId) ?? null
      : null;

  // Level the top nodes will be created at. null = "existing" chosen but no
  // parent picked yet.
  const startLevel: number | null =
    mode === "new" ? 1 : selectedParent ? selectedParent.level + 1 : null;

  // Parents you can add under = anything not already at the deepest level.
  const parentOptions = useMemo(() => {
    const cats = categoriesData?.data ?? [];
    const byOrder = (a: { displayOrder: number }, b: { displayOrder: number }) =>
      a.displayOrder - b.displayOrder;
    const opts: { id: number; label: string }[] = [];
    cats
      .filter((c) => c.level === 1)
      .sort(byOrder)
      .forEach((l1) => {
        opts.push({ id: l1.id, label: l1.name });
        cats
          .filter((c) => c.parentId === l1.id && c.level === 2)
          .sort(byOrder)
          .forEach((l2) => opts.push({ id: l2.id, label: `    ↳ ${l2.name}` }));
      });
    return opts;
  }, [categoriesData]);

  // When the anchor level changes, trim any now-too-deep descendants.
  useEffect(() => {
    if (startLevel == null) return;
    setRoots((prev) => capDepth(prev, 3 - startLevel));
  }, [startLevel]);

  const total = countNodes(roots);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "existing" && parentId == null) {
      setError("Select a parent category to add under.");
      return;
    }
    if (roots.length === 0) {
      setError("Add at least one category.");
      return;
    }
    if (hasEmptyName(roots)) {
      setError("Give every category a name (or remove the empty rows).");
      return;
    }

    try {
      const res = await createTree({
        parentId: mode === "existing" ? parentId : null,
        nodes: toPayload(roots),
      }).unwrap();
      setSuccess(
        `${res.data.length} categor${res.data.length === 1 ? "y" : "ies"} created! Redirecting…`
      );
      setTimeout(() => router.push(ROUTES.ADMIN_CATEGORIES), 1200);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create categories");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN_CATEGORIES}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Build Categories</h1>
          <p className="text-muted-foreground mt-1">
            Create a whole branch — Main → Sub → Product Group — in one go.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-md bg-primary/5 border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 p-4 rounded-md bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Where to build */}
        <Card>
          <CardHeader>
            <CardTitle>Where to build</CardTitle>
            <CardDescription>
              Start a brand-new top-level branch, or add under an existing category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <label
                className={`flex-1 flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                  mode === "new" ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "new"}
                  onChange={() => {
                    setMode("new");
                    setParentId(null);
                  }}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium">New top-level branch</span>
                  <span className="block text-xs text-muted-foreground">
                    The first row is a Level 1 Main Category.
                  </span>
                </span>
              </label>

              <label
                className={`flex-1 flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                  mode === "existing" ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "existing"}
                  onChange={() => setMode("existing")}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium">Add under existing</span>
                  <span className="block text-xs text-muted-foreground">
                    Attach a sub-branch beneath a category you pick.
                  </span>
                </span>
              </label>
            </div>

            {mode === "existing" && (
              <div className="space-y-2">
                <Label htmlFor="parent">
                  Parent category<span className="-ml-1.5 text-primary">*</span>
                </Label>
                <select
                  id="parent"
                  value={parentId ?? ""}
                  onChange={(e) =>
                    setParentId(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="">Select a category…</option>
                  {parentOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {parentOptions.length === 0 && (
                  <p className="text-xs text-amber-600">
                    ⚠️ No categories exist yet — use “New top-level branch” first.
                  </p>
                )}
                {selectedParent && startLevel && (
                  <p className="text-xs text-muted-foreground">
                    New rows start at <strong>Level {startLevel}</strong> (
                    {LEVEL_LABEL[startLevel]}) under{" "}
                    <strong>{selectedParent.name}</strong>.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* The tree */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Type names only — slugs are generated automatically (duplicates get
              a number appended). Use “+” on a row to nest a child under it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "existing" && startLevel == null ? (
              <p className="text-sm text-muted-foreground">
                Select a parent category above to start adding.
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {roots.map((node) => (
                    <NodeEditor
                      key={node.key}
                      node={node}
                      level={startLevel ?? 1}
                      onChange={(key, name) =>
                        setRoots((prev) => updateName(prev, key, name))
                      }
                      onAddChild={(key) =>
                        setRoots((prev) => addChild(prev, key))
                      }
                      onRemove={(key) =>
                        setRoots((prev) => removeNode(prev, key))
                      }
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRoots((prev) => [...prev, makeNode()])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add {LEVEL_LABEL[startLevel ?? 1]}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <span className="text-sm text-muted-foreground mr-auto">
            {total} categor{total === 1 ? "y" : "ies"} to create
          </span>
          <Link href={ROUTES.ADMIN_CATEGORIES}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating…" : "Create Categories"}
          </Button>
        </div>
      </form>
    </div>
  );
}
