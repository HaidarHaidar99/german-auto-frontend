import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Icon from "../../common/Icon";

/**
 * SortableList — Reusable list container with move up/down, add, and remove controls.
 */
export function SortableList({
  items = [],
  onReorder, // (newItems) => void
  onAdd, // () => void
  onRemove, // (index) => void
  renderItem, // (item, index) => ReactNode
  addLabel,
  maxItems = null,
  emptyMessage,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    // Update order property if present
    newItems.forEach((it, idx) => {
      if (typeof it === "object" && it !== null && "order" in it) {
        it.order = idx + 1;
      }
    });
    onReorder?.(newItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    // Update order property if present
    newItems.forEach((it, idx) => {
      if (typeof it === "object" && it !== null && "order" in it) {
        it.order = idx + 1;
      }
    });
    onReorder?.(newItems);
  };

  const canAdd = maxItems === null || items.length < maxItems;

  return (
    <div
      className={`sortable-list ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        ...style,
      }}
    >
      {items.length === 0 ? (
        <div
          style={{
            padding: "var(--space-xl) var(--space-md)",
            textAlign: "center",
            backgroundColor: "var(--color-admin-card-inner, rgba(0, 0, 0, 0.02))",
            border: "1px dashed var(--color-admin-border, rgba(0, 0, 0, 0.12))",
            borderRadius: "var(--radius-sm, 6px)",
            color: "var(--color-admin-muted, #64748b)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {emptyMessage || t("noItemsConfigured", { defaultValue: "No items configured." })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          {items.map((item, index) => (
            <div
              key={item?.id || index}
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: "var(--space-sm)",
                padding: "var(--space-md)",
                backgroundColor: "var(--color-admin-card-inner, rgba(0, 0, 0, 0.02))",
                border: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.1))",
                borderRadius: "var(--radius-sm, 6px)",
              }}
            >
              {/* Reorder Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "4px",
                  paddingRight: "var(--space-xs)",
                  borderRight: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.06))",
                }}
              >
                <IconButton
                  name="arrow-up"
                  size="sm"
                  ariaLabel={t("moveUp", { defaultValue: "Move up" })}
                  disabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                  style={{ width: "26px", height: "26px", padding: 0 }}
                />
                <IconButton
                  name="arrow-down"
                  size="sm"
                  ariaLabel={t("moveDown", { defaultValue: "Move down" })}
                  disabled={index === items.length - 1}
                  onClick={() => handleMoveDown(index)}
                  style={{ width: "26px", height: "26px", padding: 0 }}
                />
              </div>

              {/* Item Content Slot */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {renderItem ? renderItem(item, index) : JSON.stringify(item)}
              </div>

              {/* Remove Button */}
              {onRemove && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    name="trash"
                    size="sm"
                    ariaLabel={t("removeItem", { defaultValue: "Remove item" })}
                    onClick={() => onRemove(index)}
                    style={{
                      width: "30px",
                      height: "30px",
                      color: "var(--color-error, #ef4444)",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {onAdd && canAdd && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            style={{
              width: "100%",
              borderStyle: "dashed",
              fontSize: "var(--font-size-xs)",
            }}
          >
            <Icon name="plus" size={14} style={{ marginRight: "6px" }} />
            {addLabel || t("addNewItem", { defaultValue: "Add new item" })}
          </Button>
        </div>
      )}
    </div>
  );
}

export default SortableList;
