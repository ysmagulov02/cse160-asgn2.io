class Cube {
    // Constructor
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    // Render this shape
    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Front of the cube
        drawTriangle3D([0, 0, 0,  1, 1, 0,  1, 0, 0]);
        drawTriangle3D([0, 0, 0,  0, 1, 0,  1, 1, 0]);

        // Top of the cube
        drawTriangle3D([0, 1, 0,  0, 1, 1,  1, 1, 1]);
        drawTriangle3D([0, 1, 0,  1, 1, 1,  1, 1, 0]);

        // Right of the cube
        drawTriangle3D([1, 1, 0,  1, 1, 1,  1, 0, 1]);
        drawTriangle3D([1, 1, 0,  1, 0, 1,  1, 0, 0]);

        // Left of the cube
        drawTriangle3D([0, 1, 0,  0, 0, 1,  0, 1, 1]);
        drawTriangle3D([0, 1, 0,  0, 0, 0,  0, 0, 1]);

        // Bottom of the cube
        drawTriangle3D([0, 0, 0,  1, 0, 1,  1, 0, 0]);
        drawTriangle3D([0, 0, 0,  0, 0, 1,  1, 0, 1]);

        // Back of the cube
        drawTriangle3D([0, 0, 1,  1, 0, 1,  1, 1, 1]);
        drawTriangle3D([0, 0, 1,  1, 1, 1,  0, 1, 1]);
    }
}
