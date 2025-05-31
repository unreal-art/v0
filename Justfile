sync:
  scp .env.prod beef:unreal/.env


amplify:
  #!/bin/bash

  ENV_FILE=".env.prod"

  # Read each line from .env.prod
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ -n "$key" && "$key" != \#* ]]; then
      echo "Adding $key"
      amplify env add --key "$key" --value "$value"
    fi
  done < "$ENV_FILE"
