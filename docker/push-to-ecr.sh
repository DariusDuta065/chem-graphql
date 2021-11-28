aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 590624982938.dkr.ecr.eu-west-2.amazonaws.com

docker tag chem-graphql:latest 590624982938.dkr.ecr.eu-west-2.amazonaws.com/chem-graphql:latest
docker push 590624982938.dkr.ecr.eu-west-2.amazonaws.com/chem-graphql:latest
