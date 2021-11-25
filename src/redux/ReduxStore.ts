import { configureStore } from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {StonerCatsReducer} from "./StonerCatsSlice";
import {GnosisReducer} from "./GnosisSlice";
import {Web3Reducer} from "./Web3Slice";

export const Store = configureStore({
    reducer: {
        web3State: Web3Reducer,
        stonerCats: StonerCatsReducer,
        gnosis: GnosisReducer,
    },
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
