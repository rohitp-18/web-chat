import ProtectRoute from "@/components/ProtectRoute";
import { AppDispatch, RootState } from "@/store/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

function Page() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications } = useSelector(
    (state: RootState) => state.notification
  );

  return (
    <ProtectRoute>
      <div className="red"></div>
    </ProtectRoute>
  );
}

export default Page;
