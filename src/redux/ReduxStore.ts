import {configureStore, isPlain} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {StonerCatsReducer} from "./StonerCatsSlice";
import {GnosisReducer} from "./GnosisSlice";
import {Web3Reducer} from "./Web3Slice";
import {BigNumber} from "ethers";

export const Store = configureStore({
    reducer: {
        web3State: Web3Reducer,
        stonerCats: StonerCatsReducer,
        gnosis: GnosisReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            isSerializable: (value: any) => (value instanceof BigNumber) || isPlain(value)
        }
    }),
});

type RootState = ReturnType<typeof Store.getState>;
type AppDispatch = typeof Store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
