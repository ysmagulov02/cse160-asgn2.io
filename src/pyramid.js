class Pyramid {
    // Constructor
    constructor() {
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    // Render this shape
    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Tip of the pyramid, centered above the base
        var tip = [0.5, 10, 0.5]; 

        // Base vertices of the pyramid
        var base = [
            [0, 0, 0], // Bottom-left
            [1, 0, 0], // Bottom-right
            [1, 0, 1], // Top-right
            [0, 0, 1]  // Top-left
        ];

        // Draw each triangular side of the pyramid
        drawTriangle3D([...base[0], ...base[1], ...tip]); // Front face
        drawTriangle3D([...base[1], ...base[2], ...tip]); // Right face
        drawTriangle3D([...base[2], ...base[3], ...tip]); // Back face
        drawTriangle3D([...base[3], ...base[0], ...tip]); // Left face

        // Draw the base of the pyramid
        drawTriangle3D([...base[0], ...base[1], ...base[2]]);
        drawTriangle3D([...base[0], ...base[2], ...base[3]]);
    }
}
