import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { User } from '../entities';
import { logger } from '../index';
import { LogLevel } from '../logger';
import { __secret__ } from '../utils/constants';

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: __secret__,
};

export default new Strategy(opts, async (payload, done) => {
  try {
    const user = await User.find({ where: { id: payload.id } });
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    logger.log(LogLevel.ERROR, error);
  }
});
