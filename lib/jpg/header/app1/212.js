// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.YCBCR_SUBSAMP;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"YCbRc Sub Sampling", 
		defaults:{tag:tagIndex, type:3, length:2, value:0}, /* short */
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "YCbCrSubSampling (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsNumber = true;
				this.IsArray = true;
			}
			
			toString()
			{
				switch(this.getValue()[0]*10 + this.getValue()[1])
				{
					case 22: return "4:2:0"; 
					case 21: return "4:2:2"; 
					case 11: return "4:4:4"; 
					case 12: return "4:4:0"; 
					case 41: return "4:1:1"; 
				}
				return `Unknown (${this.getValue()[0]},${this.getValue()[1]}) sampling`;
			}

			performChecks()
			{
				if([1,2,4].indexOf(this.getValue()[0]) < 0 || [1,2].indexOf(this.getValue()[1]) < 0)
				{
					console.warn(`YCbCrSubSampling is wrong: ${this.getValue().join(",")}`);
				}
			}
		},
});

}