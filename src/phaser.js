import Phaser from "phaser";

// const { Matter } = Phaser.Physics.Matter;

// Matter.Engine.update = function(engine, delta) {
//     var startTime = Matter.Common.now();

//     var world = engine.world,
//         detector = engine.detector,
//         pairs = engine.pairs,
//         timing = engine.timing,
//         timestamp = timing.timestamp,
//         i;

//     delta = typeof delta !== 'undefined' ? delta : Matter.Common._baseDelta;
//     delta *= timing.timeScale;

//     // increment timestamp
//     timing.timestamp += delta;
//     timing.lastDelta = delta;

//     // create an event object
//     var event = {
//         timestamp: timing.timestamp,
//         delta: delta
//     };

//     Matter.Events.trigger(engine, 'beforeUpdate', event);

//     // get all bodies and all constraints in the world
//     var allBodies = Matter.Composite.allBodies(world),
//         allConstraints = Matter.Composite.allConstraints(world);

//     // if the world has changed
//     if (world.isModified) {
//         // update the detector bodies
//         Matter.Detector.setBodies(detector, allBodies);

//         // reset all composite modified flags
//         Matter.Composite.setModified(world, false, false, true);
//     }

//     // update sleeping if enabled
//     if (engine.enableSleeping)
//         Matter.Sleeping.update(allBodies, delta);

//     // apply gravity to all bodies
//     Matter.Engine._bodiesApplyGravity(allBodies, engine.gravity);

//     // update all body position and rotation by integration
//     if (delta > 0) {
//         Matter.Engine._bodiesUpdate(allBodies, delta);
//     }

//     // update all constraints (first pass)
//     Matter.Constraint.preSolveAll(allBodies);
//     for (i = 0; i < engine.constraintIterations; i++) {
//         Matter.Constraint.solveAll(allConstraints, delta);
//     }
//     Matter.Constraint.postSolveAll(allBodies);

//     // find all collisions
//     detector.pairs = engine.pairs;
//     var collisions = Matter.Detector.collisions(detector);

//     // update collision pairs
//     Matter.Pairs.update(pairs, collisions, timestamp);

//     // wake up bodies involved in collisions
//     if (engine.enableSleeping)
//         Matter.Sleeping.afterCollisions(pairs.list);

//     // iteratively resolve position between collisions
//     var positionDamping = Matter.Common.clamp(20 / engine.positionIterations, 0, 1);
    
//     Matter.Resolver.preSolvePosition(pairs.list);
//     for (i = 0; i < engine.positionIterations; i++) {
//         Matter.Resolver.solvePosition(pairs.list, delta, positionDamping);
//     }
//     Matter.Resolver.postSolvePosition(allBodies);

//     // update all constraints (second pass)
//     Matter.Constraint.preSolveAll(allBodies);
//     for (i = 0; i < engine.constraintIterations; i++) {
//         Matter.Constraint.solveAll(allConstraints, delta);
//     }
//     Matter.Constraint.postSolveAll(allBodies);

//     // iteratively resolve velocity between collisions
//     Matter.Resolver.preSolveVelocity(pairs.list);
//     for (i = 0; i < engine.velocityIterations; i++) {
//         Matter.Resolver.solveVelocity(pairs.list, delta);
//     }

//     // update body speed and velocity properties
//     Matter.Engine._bodiesUpdateVelocities(allBodies);

//     // trigger collision events
//     if (pairs.collisionStart.length > 0)
//         Matter.Events.trigger(engine, 'collisionStart', { pairs: pairs.collisionStart });

//     if (pairs.collisionActive.length > 0)
//         Matter.Events.trigger(engine, 'collisionActive', { pairs: pairs.collisionActive });

//     if (pairs.collisionEnd.length > 0)
//         Matter.Events.trigger(engine, 'collisionEnd', { pairs: pairs.collisionEnd });

//     // clear force buffers
//     Matter.Engine._bodiesClearForces(allBodies);

//     Matter.Events.trigger(engine, 'afterUpdate', event);

//     // log the time elapsed computing this update
//     engine.timing.lastElapsed = Matter.Common.now() - startTime;

//     return engine;
// };

// // Matter.Runner.tick = function(runner, engine, time) {
// //     var timing = engine.timing,
// //         delta;

// //     if (runner.isFixed) {
// //         // fixed timestep
// //         delta = runner.delta;
// //     } else {
// //         // dynamic timestep based on wall clock between calls
// //         delta = (time - runner.timePrev) || runner.delta;
// //         runner.timePrev = time;

// //         // optimistically filter delta over a few frames, to improve stability
// //         runner.deltaHistory.push(delta);
// //         runner.deltaHistory = runner.deltaHistory.slice(-runner.deltaSampleSize);
// //         delta = Math.min.apply(null, runner.deltaHistory);

// //         // limit delta
// //         delta = delta < runner.deltaMin ? runner.deltaMin : delta;
// //         delta = delta > runner.deltaMax ? runner.deltaMax : delta;

// //         // update engine timing object
// //         runner.delta = delta;
// //     }

// //     // create an event object
// //     var event = {
// //         timestamp: timing.timestamp
// //     };

// //     Matter.Events.trigger(runner, 'beforeTick', event);

// //     // fps counter
// //     runner.frameCounter += 1;
// //     if (time - runner.counterTimestamp >= 1000) {
// //         runner.fps = runner.frameCounter * ((time - runner.counterTimestamp) / 1000);
// //         runner.counterTimestamp = time;
// //         runner.frameCounter = 0;
// //     }

// //     Matter.Events.trigger(runner, 'tick', event);

// //     // update
// //     Matter.Events.trigger(runner, 'beforeUpdate', event);

// //     Matter.Engine.update(engine, delta);
// //     Matter.Events.trigger(runner, 'afterUpdate', event);

// //     Matter.Events.trigger(runner, 'afterTick', event);
// // };

// Matter.Body.update = function(body, deltaTime) {
//     deltaTime = (typeof deltaTime !== 'undefined' ? deltaTime : (1000 / 60)) * body.timeScale;
//     var deltaTimeSquared = deltaTime * deltaTime,
//         correction = Matter.Body._timeCorrection ? deltaTime / (body.deltaTime || deltaTime) : 1;

//     // from the previous step
//     var frictionAir = 1 - body.frictionAir * (deltaTime / Matter.Common._baseDelta),
//         velocityPrevX = (body.position.x - body.positionPrev.x) * correction,
//         velocityPrevY = (body.position.y - body.positionPrev.y) * correction;

//     // update velocity with Verlet integration
//     body.velocity.x = (velocityPrevX * frictionAir) + (body.force.x / body.mass) * deltaTimeSquared;
//     body.velocity.y = (velocityPrevY * frictionAir) + (body.force.y / body.mass) * deltaTimeSquared;

//     body.positionPrev.x = body.position.x;
//     body.positionPrev.y = body.position.y;
//     body.position.x += body.velocity.x;
//     body.position.y += body.velocity.y;
//     body.deltaTime = deltaTime;

//     // update angular velocity with Verlet integration
//     body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
//     body.anglePrev = body.angle;
//     body.angle += body.angularVelocity;

//     // REMOVED
//     // // track speed and acceleration
//     // body.speed = Matter.Vector.magnitude(body.velocity);
//     // body.angularSpeed = Math.abs(body.angularVelocity);

//     // transform the body geometry
//     for (var i = 0; i < body.parts.length; i++) {
//         var part = body.parts[i];

//         Matter.Vertices.translate(part.vertices, body.velocity);

//         if (i > 0) {
//             part.position.x += body.velocity.x;
//             part.position.y += body.velocity.y;
//         }

//         if (body.angularVelocity !== 0) {
//             Matter.Vertices.rotate(part.vertices, body.angularVelocity, body.position);
//             Matter.Axes.rotate(part.axes, body.angularVelocity);
//             if (i > 0) {
//                 Matter.Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
//             }
//         }

//         Matter.Bounds.update(part.bounds, part.vertices, body.velocity);
//     }
// };

export default Phaser;