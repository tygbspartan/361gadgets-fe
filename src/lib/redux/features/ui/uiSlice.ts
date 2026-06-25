import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  activeCategorySlug: string | null;
}

const uiSlice = createSlice({
  name: "ui",
  initialState: { activeCategorySlug: null } as UiState,
  reducers: {
    setActiveCategorySlug(state, action: PayloadAction<string | null>) {
      state.activeCategorySlug = action.payload;
    },
  },
});

export const { setActiveCategorySlug } = uiSlice.actions;
export default uiSlice.reducer;
