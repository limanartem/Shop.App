/**
 * Admin authentication middleware for the Shop.App Orders API.
 * This file contains middleware functions to verify admin role for order management.
 */

import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SessionRequest } from 'supertokens-node/framework/express';
import UserRoles from 'supertokens-node/recipe/userroles';

/**
 * Middleware function to verify the user has admin role.
 * This is used to restrict order management endpoints to admin users only.
 * 
 * @returns A middleware function that checks if the user has the admin role.
 */
export const verifyAdminRole = (): ((req: SessionRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req, res, next) => {
    if (req.session == null) {
      res.status(StatusCodes.UNAUTHORIZED).json({ 
        error: 'Unauthorized',
        message: 'User is not logged in' 
      });
      return;
    }

    const roles = await UserRoles.getRolesForUser(
      req.session.getTenantId(),
      req.session?.getUserId(),
    );

    // Check if user has admin role
    if (roles.roles.includes('admin')) {
      next();
    } else {
      res.status(StatusCodes.FORBIDDEN).json({ 
        error: 'Forbidden',
        message: 'Admin access required for this operation' 
      });
    }
  };
};

/**
 * Middleware function to verify the user has either admin role or is the owner of the resource.
 * This allows regular users to view their own orders while admins can view all orders.
 * 
 * @param getUserId Function to extract the user ID from the resource
 * @returns A middleware function that checks if the user has admin role or owns the resource
 */
export const verifyAdminOrOwner = (
  getUserId: (req: SessionRequest) => string | Promise<string>
): ((req: SessionRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req, res, next) => {
    if (req.session == null) {
      res.status(StatusCodes.UNAUTHORIZED).json({ 
        error: 'Unauthorized',
        message: 'User is not logged in' 
      });
      return;
    }

    const roles = await UserRoles.getRolesForUser(
      req.session.getTenantId(),
      req.session?.getUserId(),
    );

    // Admin users can access all resources
    if (roles.roles.includes('admin')) {
      next();
      return;
    }

    // For non-admin users, check if they own the resource
    try {
      const resourceUserId = await Promise.resolve(getUserId(req));
      const currentUserId = req.session.getUserId();

      if (resourceUserId === currentUserId) {
        next();
      } else {
        res.status(StatusCodes.FORBIDDEN).json({ 
          error: 'Forbidden',
          message: 'You do not have permission to access this resource' 
        });
      }
    } catch (error) {
      console.error('Error verifying resource ownership:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        error: 'Internal Server Error',
        message: 'Failed to verify resource access' 
      });
    }
  };
};
