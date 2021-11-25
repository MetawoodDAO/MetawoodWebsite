import {createSlice} from "@reduxjs/toolkit";
import {GnosisData} from "../ethereum/gnosis/GnosisController";

interface DataStructure {
    gnosisData?: GnosisData;
}

const initialState: DataStructure = {};

const GnosisSlice = createSlice({
    name: 'Gnosis',
    initialState,
    reducers: {
        setGnosisData: (state, action) => {
            state.gnosisData = action.payload;
        }
    }
});

export const { setGnosisData } = GnosisSlice.actions;
export const GnosisReducer = GnosisSlice.reducer;
