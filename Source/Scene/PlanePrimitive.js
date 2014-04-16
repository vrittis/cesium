/*global define*/
define([
        '../Core/defaultValue',
        '../Core/defined',
        '../Core/destroyObject',
        '../Core/DeveloperError',
        '../Renderer/createShaderSource',
        '../Renderer/Pass',
        '../Shaders/PlaneFS'
    ], function(
        defaultValue,
        defined,
        destroyObject,
        DeveloperError,
        createShaderSource,
        Pass,
        PlaneFS) {
    "use strict";

    var PlanePrimitive = function(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(options.point)) {
            throw new DeveloperError('point is required.');
        }

        if (!defined(options.normal)) {
            throw new DeveloperError('normal is required.');
        }

        if (!defined(options.depthTexture)) {
            throw new DeveloperError('depthTexture is required.');
        }

        this._point = options.point;
        this._normal = options.normal;
        this._depthTexture = options.depthTexture;

        this._command = undefined;
    };

    PlanePrimitive.prototype.update = function(scene, depthTexture) {
        if (!defined(this._command)) {
            var context = scene._context;

            var fsSource = createShaderSource({ sources : [PlaneFS] });
            var renderState = context.createRenderState();

            var that = this;
            var uniformMap = {
                u_depthTexture : function() {
                    return that._depthTexture;
                },
                u_width : function() {
                    return that._depthTexture.width;
                },
                u_height : function() {
                    return that._depthTexture.height;
                },
                u_normal : function() {
                    return that._normal;
                },
                u_point : function() {
                    return that._point;
                }
            };

            this._command = context.createViewportQuadCommand(fsSource, {
                renderState : renderState,
                uniformMap : uniformMap,
                owner : this
            });
        }

        if (defined(depthTexture) && depthTexture !== this._depthTexture) {
            this._depthTexture = depthTexture;
        }

        this._command.uniformMap.u_fovy = function() {
            return scene.camera.frustum.fovy;
        };
        this._command.uniformMap.u_aspectRatio = function() {
            return scene.camera.frustum.aspectRatio;
        };

        return this._command;
    };

    PlanePrimitive.prototype.isDestroyed = function() {
        return false;
    };

    PlanePrimitive.prototype.destroy = function() {
        if (defined(this._command)) {
            this._command.shaderProgram = this._command.shaderProgram && this._command.shaderProgram.release();
        }
        return destroyObject(this);
    };

    return PlanePrimitive;
});
