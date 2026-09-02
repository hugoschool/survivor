import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type * as React from "react";

import { cn } from "~/lib/utils";

function Drawer({
    direction,
    ...props
}: DrawerPrimitive.Root.Props & {
    direction?: "up" | "down" | "left" | "right";
}) {
    return <DrawerPrimitive.Root swipeDirection={direction} {...props} />;
}

const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerClose = DrawerPrimitive.Close;

function DrawerContent({
    className,
    children,
    ...props
}: DrawerPrimitive.Popup.Props) {
    return (
        <DrawerPrimitive.Portal>
            <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
            <DrawerPrimitive.Popup
                className={cn(
                    "fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-xl bg-background shadow-lg outline-none",
                    className,
                )}
                {...props}
            >
                {children}
            </DrawerPrimitive.Popup>
        </DrawerPrimitive.Portal>
    );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("grid gap-1.5 p-4 text-left", className)}
            {...props}
        />
    );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("mt-auto flex flex-col gap-2 p-4", className)}
            {...props}
        />
    );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
    return (
        <DrawerPrimitive.Title
            className={cn("text-lg font-semibold", className)}
            {...props}
        />
    );
}

function DrawerDescription({
    className,
    ...props
}: DrawerPrimitive.Description.Props) {
    return (
        <DrawerPrimitive.Description
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}

export {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
};
