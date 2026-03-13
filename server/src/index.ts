import config from './config';
import contentTypes from './content-types';
import controllers from './controllers';
import routes from './routes';
import register from './register';
import services from './services';

export default () => ({
  register,
  config,
  contentTypes,
  controllers,
  routes,
  services,
});
