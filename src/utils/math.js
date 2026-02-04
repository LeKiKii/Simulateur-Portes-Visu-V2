
function adj(m) { // Compute the adjugate of m
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
  ];
}

function multmm(a, b) { // multiply two matrices
  var c = Array(9);
  for (var i = 0; i != 3; ++i) {
    for (var j = 0; j != 3; ++j) {
      var cij = 0;
      for (var k = 0; k != 3; ++k) {
        cij += a[3 * i + k] * b[3 * k + j];
      }
      c[3 * i + j] = cij;
    }
  }
  return c;
}

function multmv(m, v) { // multiply matrix and vector
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
  ];
}

function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
  var m = [
    x1, x2, x3,
    y1, y2, y3,
    1,  1,  1
  ];
  var v = multmv(adj(m), [x4, y4, 1]);
  return multmm(m, [
    v[0], 0, 0,
    0, v[1], 0,
    0, 0, v[2]
  ]);
}

export function general2DProjection(
  x1s, y1s, x1d, y1d,
  x2s, y2s, x2d, y2d,
  x3s, y3s, x3d, y3d,
  x4s, y4s, x4d, y4d
) {
  var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adj(s));
}

export function getCSSMatrix(width, height, points) {
  // points: [{x,y}, {x,y}, {x,y}, {x,y}] (TL, TR, BR, BL)

  // Source points (Rectangle)
  const x1s = 0, y1s = 0;
  const x2s = width, y2s = 0;
  const x3s = width, y3s = height;
  const x4s = 0, y4s = height;

  // Dest points
  const x1d = points[0].x, y1d = points[0].y;
  const x2d = points[1].x, y1d_tr = points[1].y; // y2d
  const x3d = points[2].x, y3d = points[2].y;
  const x4d = points[3].x, y4d = points[3].y;

  const t = general2DProjection(
    x1s, y1s, x1d, y1d,
    x2s, y2s, x2d, y1d_tr,
    x3s, y3s, x3d, y3d,
    x4s, y4s, x4d, y4d
  );

  // Normalize by t[8] (bottom right element of 3x3)
  for(let i = 0; i < 9; ++i) t[i] = t[i] / t[8];

  // Map 3x3 Homography to 4x4 CSS Matrix3D
  // H = [a b c; d e f; g h 1]
  // CSS = [a, d, 0, g,  b, e, 0, h,  0, 0, 1, 0,  c, f, 0, 1]
  // Note: CSS matrix3d is column-major.
  // t = [t0, t1, t2, t3, t4, t5, t6, t7, t8]

  return `matrix3d(
    ${t[0]}, ${t[3]}, 0, ${t[6]},
    ${t[1]}, ${t[4]}, 0, ${t[7]},
    0, 0, 1, 0,
    ${t[2]}, ${t[5]}, 0, ${t[8]}
  )`;
}
