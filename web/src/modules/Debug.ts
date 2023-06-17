import { isDebugMode } from "../Config";

export const DebugLog = isDebugMode ? console.log.bind(console) : function() {}