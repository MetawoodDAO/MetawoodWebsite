import {createSlice, Draft, PayloadAction} from "@reduxjs/toolkit";
import {GnosisData} from "../ethereum/contracts/ContractTypes";

interface Loading {
    state: "Loading";
}
interface Loaded {
    state: "Loaded";
    gnosisData: GnosisData;
}
interface Error {
    state: "Error";
    message: string;
}

type DataStructure = Loading | Loaded | Error;
type State = {data: DataStructure};

const GnosisSlice = createSlice({
    name: 'Gnosis',
    initialState: {data: {state: "Loading"}} as State,
    reducers: {
        setGnosisData: (state: Draft<State>, action: PayloadAction<DataStructure>) => {
            state.data = action.payload;
        }
    }
});

export const { setGnosisData } = GnosisSlice.actions;
export const GnosisReducer = GnosisSlice.reducer;
