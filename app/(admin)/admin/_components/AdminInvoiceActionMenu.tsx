"use client";

import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

type MenuPosition = {
  left: number;
  top: number;
  visible: boolean;
};

export function AdminInvoiceActionMenu({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({
    left: -9999,
    top: -9999,
    visible: false,
  });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function updatePosition() {
    const trigger = triggerRef.current;
    const menu = menuRef.current;

    if (!trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();

    const menuWidth = menu.offsetWidth || 250;
    const menuHeight = menu.offsetHeight || 150;

    const gap = 8;
    const viewportPadding = 12;

    const availableBelow =
      window.innerHeight - triggerRect.bottom - gap - viewportPadding;

    const availableAbove =
      triggerRect.top - gap - viewportPadding;

    const shouldOpenUpward =
      availableBelow < menuHeight && availableAbove > availableBelow;

    const top = shouldOpenUpward
      ? Math.max(
          viewportPadding,
          triggerRect.top - menuHeight - gap
        )
      : Math.min(
          window.innerHeight - menuHeight - viewportPadding,
          triggerRect.bottom + gap
        );

    const left = Math.max(
      viewportPadding,
      Math.min(
        triggerRect.right - menuWidth,
        window.innerWidth - menuWidth - viewportPadding
      )
    );

    setPosition({
      left,
      top,
      visible: true,
    });
  }

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleResizeOrScroll = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        aria-expanded={isOpen}
        className="admin-action-menu-trigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        Aktionen
        <ChevronDown
          className={isOpen ? "admin-action-menu-chevron is-open" : "admin-action-menu-chevron"}
          size={14}
        />
      </button>

      {isOpen &&
        isMounted &&
        createPortal(
          <div
            ref={menuRef}
            className="admin-smart-action-menu"
            role="menu"
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
              visibility: position.visible ? "visible" : "hidden",
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}