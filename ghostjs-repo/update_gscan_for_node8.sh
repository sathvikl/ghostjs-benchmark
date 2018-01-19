#!/bin/bash

if [ -z "$1" ]
  then
    NPM=`which npm`
else
    NPM=$1
fi

ghost_version=`grep -A 1 "\"name\": \"ghost\"" package.json | grep version | awk {'print $2'} | cut -d, -f1`
echo -e "Ghost Version used: $ghost_version"  

if  [ "$ghost_version" = "\"0.11.7\"" ]; then
  echo -e "Ghost version:0.11.7 requires gscan to use require-dir:0.3.2"
  echo -e "rm on node_modules/gscan/node_modules"

  GHOST_NODE_VERSION_CHECK=false $NPM install
  rm -fr node_modules/gscan/node_modules 
  sed -i 's/\"require-dir\": \"0.1.0\"/\"require-dir\": \"0.3.2\"/g' node_modules/gscan/package.json
  pushd node_modules/gscan/
  GHOST_NODE_VERSION_CHECK=false $NPM install 
  popd
  exit 0
elif [ "$ghost_version" = "\"1.17.1\"" ]; then
  GHOST_NODE_VERSION_CHECK=false yarn install 
fi
