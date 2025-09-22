{

const tagIndex = JPGCONST.EXIF.COMP_CONFIG;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Components Configuration", 
		exif: 2.1,
		defaults:{tag:tagIndex, type:7, length:4, value:0x000000},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "ComponentsConfiguration (" + name + ")", bigEndian, tagIndex);

				this.IsNumber = true;
			}

			performChecks()
			{
				if(this.Length != 4)
				{
					console.warn("The Length of ComponentsConfiguration must be 4");
				}
			}

			toString()
			{
				const val = this.getValue();
				let ret = [];
				for(let j=0;j<4;j++)
				{
					switch(val[j].charCodeAt(0))
					{
						case 0: ret.push("Unused"); break;
						case 1: ret.push("Y"); break;
						case 2: ret.push("Cb"); break;
						case 3: ret.push("Cr"); break;
						case 4: ret.push("R"); break;
						case 5: ret.push("G"); break;
						case 6: ret.push("B"); break;
						default: ret.push("INVALID!"); break;
					}
				}
				return ret.join(", ");
			}
		},
});

}