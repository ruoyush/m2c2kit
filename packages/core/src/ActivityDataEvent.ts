import { ActivityEvent } from "./ActivityEvent";
import { ActivityData } from "./ActivityData";
import { ActivityMetric } from "./ActivityMetric";
import { JsonSchema } from "./JsonSchema";

export interface ActivityDataEvent extends ActivityEvent {
  newData: ActivityData;
  newDataSchema: JsonSchema;
  data: ActivityData;
  dataSchema: JsonSchema;
  activityConfiguration: unknown;
  activityConfigurationSchema: JsonSchema;
  activityMetrics?: Array<ActivityMetric>;
}
