import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants=cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-semibold uppercase tracking-[0.12em] transition disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground",outline:"border border-input bg-background hover:bg-accent",secondary:"bg-secondary text-secondary-foreground",ghost:"hover:bg-accent",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-11 px-5",sm:"h-9 px-3",lg:"h-12 px-8",icon:"size-10 p-0"}},defaultVariants:{variant:"default",size:"default"}});
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof buttonVariants>{asChild?:boolean}
export const Button=forwardRef<HTMLButtonElement,ButtonProps>(({className,type="button",variant,size,...props},ref)=><button ref={ref} type={type} className={cn(buttonVariants({variant,size}),className)} {...props}/>);Button.displayName="Button";
