/**
 * @zikka/vanta.js - Entry point for npm
 * Import base (registers VANTA) then all effects so they register themselves.
 */
import VantaBase from './_base';
import { VANTA } from './_base';
import './vanta.birds';
import './vanta.fog';
import './vanta.waves';
import './vanta.clouds';
import './vanta.clouds2';
import './vanta.globe';
import './vanta.net';
import './vanta.cells';
import './vanta.trunk';
import './vanta.topology';
import './vanta.dots';
import './vanta.rings';
import './vanta.halo';
import './vanta.ripple';

export { VANTA, VantaBase };
export default VANTA;
