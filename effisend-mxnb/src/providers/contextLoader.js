import { Fragment, useCallback, useContext, useEffect } from "react";
import ContextModule from "./contextModule";
import { getAsyncStorageValue } from "../core/utils";

export default function ContextLoader() {
  const context = useContext(ContextModule);
  const checkStarter = useCallback(async () => {
    const address = await getAsyncStorageValue("address");
    if (address === null) {
      context.setValue({
        starter: true,
      });
    } else {
      const clabe = await getAsyncStorageValue("clabe");
      const rclabe = await getAsyncStorageValue("rclabe");
      const balances = await getAsyncStorageValue("balances");
      const usdConversion = await getAsyncStorageValue("usdConversion");
      context.setValue({
        clabe: clabe ?? context.value.clabe,
        rclabe: rclabe ?? context.value.rclabe,
        address: address ?? context.value.address,
        balances: balances ?? context.value.balances,
        usdConversion: usdConversion ?? context.value.usdConversion,
        starter: true,
      });
    }
  }, [context]);

  useEffect(() => {
    checkStarter();
  }, []);

  return <Fragment />;
}
