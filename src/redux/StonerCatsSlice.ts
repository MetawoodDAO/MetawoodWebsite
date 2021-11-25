import {StonerCatAndPoster} from "../ethereum/contracts/StonerCatsContract";
import {createSlice} from "@reduxjs/toolkit";

interface DataStructure {
    catsAndPosters?: StonerCatAndPoster[];
}

const initialState: DataStructure = {}

const StonerCatsSlice = createSlice({
    name: "StonerCats",
    initialState,
    reducers: {
        setCats: (state, action) => {
            state.catsAndPosters = action.payload;
        }
    }
});

export const { setCats } = StonerCatsSlice.actions;
export const StonerCatsReducer = StonerCatsSlice.reducer;
