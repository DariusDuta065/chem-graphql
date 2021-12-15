EC2_SERVERS=$(
  aws ec2 describe-instances \
    --filter Name=tag:env,Values=$ENV \
    --filter Name=tag:project,Values=$PROJECT \
    --filter Name=tag:instance-type,Values=$INSTANCE_TYPE |
    jq '.Reservations[].Instances[].PublicIpAddress' |
    tr -d '"'
  )

for server in $EC2_SERVERS; do
  echo "Deploying on: $server"
  curl "$server:8090/deploy" \
    --fail \
    --max-time $CURL_MAX_TIME
done
