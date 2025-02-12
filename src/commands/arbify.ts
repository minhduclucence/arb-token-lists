import { ArbTokenList } from '../lib/types';
import { addPermitTags } from '../PermitTokens/permitSignature';
import { writeToFile, getPath } from '../lib/store';
import { Action, Args } from '../lib/options';
import { arbifyL1List } from '../lib/token_list_gen';

export const command = Action.Arbify;

export const handler = async (argvs: Args) => {
  const includeOldDataFields: boolean = !!argvs.includeOldDataFields;

  const { newList, l1ListName } = await arbifyL1List(argvs.tokenList, {
    includeOldDataFields,
    ignorePreviousList: argvs.ignorePreviousList,
  });
  let tokenList: ArbTokenList = newList;
  const path = getPath(l1ListName);

  if (argvs.includePermitTags) tokenList = await addPermitTags(tokenList);
  writeToFile(tokenList, path);
  return tokenList;
};
