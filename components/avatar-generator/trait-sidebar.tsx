"use client";

import { Shuffle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TRAIT_CATEGORIES } from "@/lib/avatar-generator/traits-config";
import type { TraitSidebarProps, TraitSelection } from "./types";

export function TraitSidebar({ 
  selectedTraits, 
  onTraitChange, 
  onRandomize, 
  isGenerating 
}: TraitSidebarProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4" />
            Customize Traits
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRandomize}
            disabled={isGenerating}
            className="flex items-center gap-1 h-7 text-xs"
          >
            <Shuffle className="w-3 h-3" />
            Random
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {TRAIT_CATEGORIES.map((category) => (
          <div key={category.key} className="space-y-2">
            <h3 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
              {category.label}
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {category.options.map((option) => {
                const isSelected = selectedTraits[category.key as keyof TraitSelection] === option;
                return (
                  <button
                    key={option}
                    onClick={() => onTraitChange(category.key as keyof TraitSelection, option)}
                    disabled={isGenerating}
                    className={cn(
                      "p-2 text-left rounded-md border transition-all text-xs",
                      "hover:border-primary/50 hover:bg-primary/5",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected 
                        ? "border-primary bg-primary/10 text-primary font-medium" 
                        : "border-border bg-card"
                    )}
                  >
                    <span className="capitalize">
                      {option === "none" ? "None" : option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      </CardContent>
    </Card>
  );
}
