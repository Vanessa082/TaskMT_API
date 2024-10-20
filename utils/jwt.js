import jwt from 'jsonwebtoken';
import { appConfig } from '../config/config.js';

export function signToken(payload, options) {
  return jwt.sign(payload, appConfig.JWT_SECRET, options)
}

export function verifyToken(token) {
  return jwt.verify(token, appConfig.JWT_SECRET)
}