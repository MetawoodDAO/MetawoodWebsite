import {createSlice, Draft, PayloadAction} from "@reduxjs/toolkit";
import {StonerCatAndPoster} from "../ethereum/contracts/ContractTypes";

interface DataStructure {
    catsAndPosters?: StonerCatAndPoster[];
}

const StonerCatsSlice = createSlice({
    name: "StonerCats",
    initialState: {} as DataStructure,
    reducers: {
        setCats: (state: Draft<DataStructure>, action: PayloadAction<StonerCatAndPoster[] | undefined>) => {
            state.catsAndPosters = action.payload;
        }
    }
});

export const { setCats } = StonerCatsSlice.actions;
export const StonerCatsReducer = StonerCatsSlice.reducer;
