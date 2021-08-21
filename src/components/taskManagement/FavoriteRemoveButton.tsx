import { FavoriteButtonInterface } from "../../types/types";
import React from "react";

export function FavoriteRemoveButton({
  handleFavorite,
  entry,
  editMode,
}: FavoriteButtonInterface) {
  return (
    <button
      onClick={() => handleFavorite(entry.id)}
      disabled={editMode.isEditing && editMode.id !== entry.id}
      style={{
        // marginRight: "1em",
        padding: "0.25em 1em",
      }}
      title="Remover Favorito"
    >
      <i className="fas fa-exclamation-circle" />
    </button>
  );
}
