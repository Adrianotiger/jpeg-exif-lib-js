// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.FNUMBER;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Focal Number", 
		defaults:{tag:tagIndex, type:5, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Focal Number (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			toString()
			{
				return this.getValue()[0] * 1.0 / this.getValue()[1];
			}
		},
});

}