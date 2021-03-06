window.addEventListener('DOMContentLoaded', function () {

  // ファイルが選択されたら実行
  document.getElementById("uploadFile").addEventListener('change', function (e) {
    //ファイルを選択したときのファイル情報のオブジェクト
    const fileReader = new FileReader();
    const file = document.getElementById("uploadFile").files[0];
    const fileExtension = document.getElementById("uploadFile").value.split(".").pop();
    if (fileExtension !== "csv") {
      window.alert("The format of the selected file is incorrect");
      return;
    }
    // ファイルの読み込みを行ったら実行
    fileReader.addEventListener('load', function (e) {
      //csvデータの中身を整えて配列にする関数
      function arrayCSV() {
        const fileDatas = e.target.result.split(/\r\n|\n/); // 改行を区切り文字として行を要素とした配列を生成
        const noEmptyFileDatas = fileDatas.filter(function (s) { // 空要素削除
          return s !== '';
        });
        return noEmptyFileDatas;
      }
      // arrayCSV関数の返り値を代入
      const noEmptyFileDatas = arrayCSV();
      // オブジェクトのkey要素取得
      const keys = noEmptyFileDatas[0].split(',');
      //name属性と比較するためcsvデータに[]を付与
      for (let i = 0; i < keys.length; i++) {
        keys[i] += "[]";
      }
      //csvデータ配列をオブジェクトにする
      function objectCSV() {
        //カンマごとに要素を区切って配列に格納
        const csvDatas = noEmptyFileDatas.map(rowOfFileData => rowOfFileData.split(','));
        //オブジェクトのkey要素削除
        csvDatas.splice(0, 1);
        //csvデータのオブジェクト生成
        const csvInfos = [];
        csvDatas.forEach((data, csvNumber) => {
          let csvGroup = {};
          keys.forEach((key, index) => {
            csvGroup[key] = csvDatas[csvNumber][index];
          })
          csvInfos.push(csvGroup);
        })
        return csvInfos;
      }
      // objectCSV関数の返り値を代入
      const csvInfos = objectCSV();
      const result = window.confirm(`Do you want to read ${csvInfos.length} data of the selected ${file.name}?`)
      //ファイル選択をクリア
      document.getElementById("uploadFile").value = "";
      if (result === false) {
        return;
      }
      //editingクラス削除
      function deleteClass() {
        const targetClassName = Array.from(document.getElementsByClassName("editing"));
        targetClassName[0].classList.remove("editing");
      }
      deleteClass();
      //複製元参照
      const contentArea = Array.from(document.getElementsByClassName("item-template"));
      csvInfos.forEach((csvElement, csvIndex) => {
        //元々あったフォームの数情報
        const prevTd = Array.from(document.getElementsByClassName("sortable-item"))
        prevTd.pop();
        //複製元の値操作と複製実行
        function CopySourceOperation() {
          //複製要素にitem-templateクラスをつけたくないため削除
          contentArea[0].classList.remove("item-template");
          //複製
          const cloneElement = contentArea[0].cloneNode(true);
          //item-templateを複制元に付与
          contentArea[0].classList.add("item-template");
          // 複製した要素の属性を編集
          return cloneElement;
        }
        // CopySourceOperation関数の返り値を代入
        const cloneElement = CopySourceOperation();
        //複製要素のdisplay:noneを削除
        cloneElement.removeAttribute("style");
        //複製した階層の値編集
        function EditFormAttribute() {
          //複製した要素の子孫要素編集
          const formElement = Array.from(cloneElement.querySelectorAll("input,select,textarea"));
          keys.forEach((key, index) => {
            formElement.forEach((form) => {
              form.removeAttribute("disabled");
              if (form.name === key) {
                form.name = key.replace('[]', '[' + prevTd.length + ']');
                if (form.nodeName === "INPUT") {
                  if (form.type === "text") {
                    form.value = Object.values(csvElement)[index];
                  } else if (form.type === "radio" || form.type === "checkbox") {
                    if (form.value === Object.values(csvElement)[index]) {
                      form.checked = true;
                    }
                  }
                } else if (form.nodeName === "SELECT") {
                  //optionタグにselectedをつける編集
                  const optionElement = form.querySelectorAll("option");
                  optionElement.forEach((option) => {
                    if (option.value === Object.values(csvElement)[index]) {
                      option.selected = true;
                    }
                  })
                } else if (form.nodeName === "TEXTAREA") {
                  form.value = Object.values(csvElement)[index];
                }
              }
            })
          })
        }
        console.log(cloneElement)
        EditFormAttribute();
        contentArea[0].before(cloneElement);
      });
      ACMS.Dispatch.fieldgroupSortable(".js-fieldgroup-sortable");
    });
    //指定されたファイルの内容を読み取り、完了後csvDatasプロパティにファイルの内容を文字列として格納
    fileReader.readAsText(e.target.files[0]);
  });
});
