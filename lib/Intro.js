require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const VECTOR_TYPES = ['VECTOR', 'LINE', 'REGULAR_POLYGON', 'ELLIPSE'];
const GROUP_TYPES = ['GROUP', 'BOOLEAN_OPERATION'];

(function(){