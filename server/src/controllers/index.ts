import send from './send';
import settings from './settings';
import triggers from './triggers';
import contentTypes from './content-types';
import depthAttributes from './depth-attributes';
import generateHtml from './generate-html';
import defaultTemplate from './default-template';

export default {
  send,
  settings,
  triggers,
  'content-types': contentTypes,
  'depth-attributes': depthAttributes,
  'generate-html': generateHtml,
  'default-template': defaultTemplate,
};
